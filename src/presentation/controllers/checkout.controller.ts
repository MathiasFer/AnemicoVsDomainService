import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CheckoutApplicationService } from '../../application/services/CheckoutApplicationService';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutApplicationService,
  ) {}

  @Post()
  comprar(@Body() body: any) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('El body de la compra es obligatorio');
    }

    return this.checkoutService.comprar(
      body.usuario,
      body.productos,
      body.cupon,
      body.envio,
    );
  }
}