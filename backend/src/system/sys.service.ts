import * as fs from 'fs/promises';

export class SysService {
     private iface: string;
  private rxPath: string;
  private txPath: string;

  constructor(iface = 'ens3') {
    this.iface = iface;
    this.rxPath = `/sys/class/net/${iface}/statistics/rx_bytes`;
    this.txPath = `/sys/class/net/${iface}/statistics/tx_bytes`;
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getSpeed(): Promise<number> {
    const rx1 = Number(await fs.readFile(this.rxPath, 'utf8'));
    const tx1 = Number(await fs.readFile(this.txPath, 'utf8'));

    await this.sleep(500);

    const rx2 = Number(await fs.readFile(this.rxPath, 'utf8'));
    const tx2 = Number(await fs.readFile(this.txPath, 'utf8'));

    return (rx2 - rx1 + tx2 - tx1) * 8 * 2; // bit/sec
  }
}