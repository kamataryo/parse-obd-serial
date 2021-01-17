import SerialPort from 'serialport'

const path = '/dev/tty.OBDII-SPPslave'
const { Readline } = SerialPort.parsers;

type SerialPortWriter = (data: string) => Promise<string>
type SerialPortParser = SerialPort.parsers.Readline

export const connectToPort = () => new Promise<[SerialPort, SerialPortWriter, SerialPortParser]>((resolve, reject) => {
    const port = new SerialPort(path, { baudRate: 9600, autoOpen: false })
    const parser = port.pipe(new Readline({ delimiter: '\r' }));

    console.log(`[SP] opening on ${path}..`)

    const writer: SerialPortWriter = (data) => {
        console.log(`[SP] writing data: ${data}`)
        return new Promise((resolve, reject) => {
            port.write(data + '\r', (error) => {
                if(error) {
                    reject(error)
                } else {
                    resolve(data)
                }
            })
        })
    }

    port.open((error) => {
        if(error) {
            console.log('[SP] port opening error.')
            console.error(error)
            reject(error)
            process.exit(3)
        } else {
            console.log('[SP] port opend.')
            resolve([port , writer, parser])
        }
    })
})
