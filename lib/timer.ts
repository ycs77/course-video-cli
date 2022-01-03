import { hrtime } from 'process'

export class Timer {
  public startTime = 0n
  public endTime = 0n

  start() {
    this.startTime = hrtime.bigint()
  }

  stop() {
    this.endTime = hrtime.bigint()
  }

  get seconds() {
    return Math.round(Number(this.endTime - this.startTime) / Math.pow(10, 9))
  }
}

export function createTimer() {
  return new Timer()
}
