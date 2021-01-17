import WebSocket from 'ws'

export const createSocket = () => new Promise<WebSocket>((resolve, reject) => {
    console.log('[WS] connecting...')
    const wss = new WebSocket.Server({ port: 8081 })
    wss.on('connection', (ws) => {
        console.log('[WS] connected.')
        resolve(ws)
    })
})
