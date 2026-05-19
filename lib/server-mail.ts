import tls from 'node:tls'

type SendMailOptions = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

const SMTP_HOST = 'smtp.gmail.com'
const SMTP_PORT = 465

function escapeSmtpData(value: string) {
  return value
    .replace(/\r?\n/g, '\r\n')
    .replace(/^\./gm, '..')
}

function formatAddress(value: string) {
  return /<[^>]+>/.test(value) ? value : `<${value}>`
}

async function readSmtpResponse(socket: tls.TLSSocket, bufferRef: { value: string }) {
  while (true) {
    const lines = bufferRef.value.split('\r\n')
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i]
      if (/^\d{3} /.test(line)) {
        bufferRef.value = lines.slice(i + 1).join('\r\n')
        return line
      }
    }

    const chunk = await new Promise<string>((resolve, reject) => {
      const onData = (data: Buffer | string) => {
        cleanup()
        resolve(typeof data === 'string' ? data : data.toString('utf8'))
      }
      const onError = (error: Error) => {
        cleanup()
        reject(error)
      }
      const onClose = () => {
        cleanup()
        reject(new Error('SMTP connection closed unexpectedly'))
      }
      const cleanup = () => {
        socket.off('data', onData)
        socket.off('error', onError)
        socket.off('close', onClose)
      }

      socket.once('data', onData)
      socket.once('error', onError)
      socket.once('close', onClose)
    })

    bufferRef.value += chunk
  }
}

async function sendCommand(
  socket: tls.TLSSocket,
  bufferRef: { value: string },
  command: string,
  expectedCodes: number[]
) {
  socket.write(`${command}\r\n`)
  const response = await readSmtpResponse(socket, bufferRef)
  const code = Number(response.slice(0, 3))
  if (!expectedCodes.includes(code)) {
    throw new Error(`SMTP ${command.split(' ')[0]} failed: ${response}`)
  }
  return response
}

export async function sendMail({ to, subject, html, replyTo }: SendMailOptions) {
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpUser || !smtpPass) {
    throw new Error('Missing SMTP_USER or SMTP_PASS')
  }

  const recipients = Array.isArray(to) ? to : [to]
  const from = process.env.SMTP_FROM_EMAIL ?? smtpUser
  const bufferRef = { value: '' }

  const socket = await new Promise<tls.TLSSocket>((resolve, reject) => {
    const client = tls.connect({
      host: SMTP_HOST,
      port: SMTP_PORT,
      servername: SMTP_HOST,
    }, () => resolve(client))
    client.once('error', reject)
  })

  try {
    const greeting = await readSmtpResponse(socket, bufferRef)
    if (!greeting.startsWith('220')) {
      throw new Error(`SMTP greeting failed: ${greeting}`)
    }

    await sendCommand(socket, bufferRef, 'EHLO localhost', [250])
    await sendCommand(socket, bufferRef, 'AUTH LOGIN', [334])
    await sendCommand(socket, bufferRef, Buffer.from(smtpUser).toString('base64'), [334])
    await sendCommand(socket, bufferRef, Buffer.from(smtpPass).toString('base64'), [235])
    await sendCommand(socket, bufferRef, `MAIL FROM:${formatAddress(from)}`, [250])

    for (const recipient of recipients) {
      await sendCommand(socket, bufferRef, `RCPT TO:${formatAddress(recipient)}`, [250, 251])
    }

    await sendCommand(socket, bufferRef, 'DATA', [354])

    const headers = [
      `From: ${from}`,
      `To: ${recipients.join(', ')}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      replyTo ? `Reply-To: ${replyTo}` : null,
    ].filter(Boolean).join('\r\n')

    socket.write(`${headers}\r\n\r\n${escapeSmtpData(html)}\r\n.\r\n`)

    const dataResponse = await readSmtpResponse(socket, bufferRef)
    if (!dataResponse.startsWith('250')) {
      throw new Error(`SMTP DATA failed: ${dataResponse}`)
    }

    await sendCommand(socket, bufferRef, 'QUIT', [221])
  } finally {
    socket.end()
  }
}
