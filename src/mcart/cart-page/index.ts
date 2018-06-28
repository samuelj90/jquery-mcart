import { CartModel } from "../cart/cart-model";
import { Cart } from "../cart";
import { CartPageOptions } from "./cart-page-options";
import { isNullOrUndefined } from "../utils";
import { defaultCartPageOptions } from "./default-cart-page-options";
import { CartItem } from "../cart/cart-item";
import { Product } from "../product-listing/product";
import *  as ejs from "ejs";
import { RenderToElementNotFound } from "../render-to-element-notfound";
import { Order } from "../order";

export class CartPage {
    private orderModel: any = {
        shippingFormValid: false
    };
    constructor(cartPageOptions: CartPageOptions) {
        const behaviourSubject = Cart.getInstance().getCartModelSubject();
        const self = this;
        behaviourSubject.subscribe(
            function (cartModel: CartModel) {
                self.renderCartPage(cartPageOptions, cartModel);
                // TODO: Remove unused event bindings.
            },
            function (error) {
                console.error("Error", error);
            },
            function () {
                console.debug("Completed behaviour subject subscription");
            }
        );
    }
    private renderCartPage(cartPageOptions: CartPageOptions, cartModel: CartModel): void {
        try {
            if (cartPageOptions.renderToElement.length <= 0) {
                throw new RenderToElementNotFound(cartPageOptions.renderToElement, "renderToElement of cartpage is not found in DOM");
            }
            cartPageOptions = $.extend({}, defaultCartPageOptions, cartPageOptions);
            if (cartPageOptions.replaceRenderToElementContent) {
                cartPageOptions.renderToElement.html("");
            }
            if (!!cartPageOptions.cartFormElement) {
                cartPageOptions.renderToElement.off("submit", cartPageOptions.cartFormElement);
            }
            if (!!cartPageOptions.cartItemIncrementerElement) {
                cartPageOptions.renderToElement.off("click", cartPageOptions.cartItemIncrementerElement);
            }
            if (!!cartPageOptions.cartItemDecrementerElement) {
                cartPageOptions.renderToElement.off("click", cartPageOptions.cartItemDecrementerElement);
            }
            if (!!cartPageOptions.cartItemRemoveElement) {
                cartPageOptions.renderToElement.off("click", cartPageOptions.cartItemRemoveElement);
            }
            if (!!cartPageOptions.beforeCartPageRender) {
                cartPageOptions.beforeCartPageRender(cartPageOptions, cartPageOptions.templateOptions);
            }
            let templateData = {
                cartModel: cartModel,
                templateOptions: cartPageOptions.templateOptions
            };
            let template = ejs.compile(cartPageOptions.template)(templateData);
            cartPageOptions.renderToElement.append(template);
            if (!!cartPageOptions.afterCartPageRender) {
                cartPageOptions.afterCartPageRender(cartPageOptions, cartPageOptions.templateOptions);
            }
            if (!!cartPageOptions.cartFormElement) {
                let self = this;
                cartPageOptions.renderToElement.find("form" + cartPageOptions.cartFormElement).on("submit", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    let $this = $(this);
                    cartPageOptions.onCartFormSubmit(Cart.getInstance(), Order.getInstance(), cartPageOptions, event, $this);
                });
            }
            let cartRefernce = Cart;
            if (!!cartPageOptions.cartItemIncrementerElement) {
                cartPageOptions.renderToElement.on("click", cartPageOptions.cartItemIncrementerElement, function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    let $this = $(this);
                    let cartItem = $this.data("cartitem") as CartItem;
                    cartPageOptions.onCartItemIncrementerElementClicked(Cart.getInstance(), cartPageOptions, cartItem, event, $this);
                });
            }
            if (!!cartPageOptions.cartItemDecrementerElement) {
                cartPageOptions.renderToElement.on("click", cartPageOptions.cartItemDecrementerElement, function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    let $this = $(this);
                    let cartItem = $this.data("cartitem") as CartItem;
                    cartPageOptions.onCartItemDecrementerElementClicked(Cart.getInstance(), cartPageOptions, cartItem, event, $this);
                });
            }
            if (!!cartPageOptions.cartItemRemoveElement) {
                cartPageOptions.renderToElement.on("click", cartPageOptions.cartItemRemoveElement, function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    let $this = $(this);
                    let cartItem = $this.data("cartitem") as CartItem;
                    cartPageOptions.onCartItemRemoveElementClicked(Cart.getInstance(), cartPageOptions, cartItem, event, $this);
                });
            }
        } catch (error) {
            console.debug(error);
        }
    }
    /* private serializeFormData($form): any {
        let formData = {};
        let formArray = $form.serializeArray();
        $.each(formArray, function() {
            if (formData[this.name]) {
                if (!formData[this.name].push) {
                    formData[this.name] = [formData[this.name]];
                }
                formData[this.name].push(this.value || "");
            } else {
                formData[this.name] = this.value || "";
            }
        });
        return formData;
    } */
}