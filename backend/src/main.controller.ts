import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";


@Controller()
export class MainController {
    @Get('/')
    homePage(@Res() res: Response){
        res.send('Welcome to the backend!')
    }
}