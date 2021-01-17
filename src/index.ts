import { createSocket } from "./ws"
import { connectToPort } from './serialport'

const sleep = (ms: number) => new Promise((resolve) => {
    setTimeout(resolve, ms)
})

// write data
const main = async () => {
    console.log('start')

    const [socket, [serialPort, portWrite, parser]] = await Promise.all([createSocket(), connectToPort()])
    
    // crash on error
    socket.on('error', (error) => {
        console.log('[WS] error.')
        console.error(error)
        process.exit(1)
    })
    serialPort.on('error', (error) => {
        console.log('[SP] error.')
        console.error(error)
        process.exit(2)
    })

    // data reader
    parser.on('data', (data: string) => {
        const [mode, pid, ...values] = data.split(' ')

        let modeNum
        try {
            modeNum = parseInt(mode, 10) - 40  
        } catch {}

        if(modeNum === 1) {
            const hexValue = parseInt(values.filter(value => value !== '').join(''), 16)
            if (pid === '05') {
                console.log('EngineCoolantTemperature: ' + (hexValue - 40))
                socket.send(JSON.stringify({ EngineCoolantTemperature: hexValue - 40 }))               
            } else if(pid === '0C') {
                console.log('EngineRPM: ' + hexValue / 4)
                socket.send(JSON.stringify({ engineRPM: hexValue / 4 }))
            } else if(pid === '0D') {
                console.log('Current Speed: ' + hexValue)
                socket.send(JSON.stringify({currentSpeed: hexValue}))
            }
        }
    })

    await portWrite('AT Z')
    await sleep(3000)
    await portWrite('AT SP 0')
    await sleep(3000)

    while (true) {
        await portWrite('0105') // Engine coolant temperature
        await sleep(3000)
        await portWrite('010C') // Engine RPM
        await sleep(3000)
        await portWrite('010D') // Speed
        await sleep(3000)
        // await portWrite('010F') // intake air temperature
        // await sleep(100)
        // await portWrite('0111') // Throttle position        
        // await sleep(100)
    }
}

main()