import { CheckoutApplicationService } from '../../application/services/CheckoutApplicationService';
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutApplicationService);
    comprar(body: any): number;
}
