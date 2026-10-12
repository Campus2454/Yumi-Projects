import { Controller, Get } from "@nestjs/common";
import { SysService } from "./sys.service";

@Controller('system')
export class SysController {
    constructor(private readonly sysService: SysService) {}
   
    @Get('net-speed')
    async getSpeed() {
        const s = await this.sysService.getSpeed();
        return {speed: s};
    }
}