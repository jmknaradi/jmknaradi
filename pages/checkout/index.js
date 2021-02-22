import React, { Component } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Link from "next/link";
import ccFormat from "../../utils/ccFormat";
import commerce from "../../lib/commerce";
import Root from "../../components/common/Root";
import ShippingForm from "../../components/checkout/common/ShippingForm";
import PaymentDetails from "../../components/checkout/common/PaymentDetails";
import BillingDetails from "../../components/checkout/common/BillingDetails";
import Loader from "../../components/checkout/Loader";
import {
  generateCheckoutTokenFromCart as dispatchGenerateCheckout,
  getShippingOptionsForCheckout as dispatchGetShippingOptions,
  setShippingOptionInCheckout as dispatchSetShippingOptionsInCheckout,
  setDiscountCodeInCheckout as dispatchSetDiscountCodeInCheckout,
  captureOrder as dispatchCaptureOrder,
} from "../../store/actions/checkoutActions";
import { connect } from "react-redux";
import { withRouter } from "next/router";
import { CardElement, Elements, ElementsConsumer } from "@stripe/react-stripe-js";

/**
 * Render the checkout page
 */
const PAYNMENT_METHODS = [
  { id: "Platba předem", price: 0 },
  { id: "Dobírka", price: 100 },
];

class CheckoutPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      deliveryCountry: "CA",
      deliveryRegion: "BC",

      // string property names to conveniently identify inputs related to commerce.js validation errors
      // e.g error { param: "shipping[name]"}
      firstName: "",
      lastName: "",
      "customer[email]": "",
      "customer[id]": null,
      "shipping[name]": "",
      ico: "",
      phone: "",
      dic: "",
      orderNotes: "",

      "fulfillment[shipping_method]": "Platba předem",
      billingPostalZipcode: "",

      errors: {
        "fulfillment[shipping_method]": null,
        gateway_error: null,
        "customer[email]": null,
        "shipping[name]": null,
        "shipping[street]": null,
        "shipping[postal_zip_code]": null,
      },
      loading: false,
    };

    this.captureOrder = this.captureOrder.bind(this);
    this.handleChangeForm = this.handleChangeForm.bind(this);
    this.handleCaptureSuccess = this.handleCaptureSuccess.bind(this);
    this.handleCaptureError = this.handleCaptureError.bind(this);
    this.redirectOutOfCheckout = this.redirectOutOfCheckout.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    // if cart is empty then redirect out of checkout;
    if (this.props.cart && this.props.cart.total_items === 0) {
      this.redirectOutOfCheckout();
    }

    this.updateCustomerFromRedux();
  }

  componentDidUpdate(prevProps) {
    // if cart items have changed then regenerate checkout token object to reflect changes.
    if (
      prevProps.cart &&
      prevProps.cart.total_items !== this.props.cart.total_items &&
      !this.props.orderReceipt
    ) {
      // reset selected shipping option
      this.setState({
        "fulfillment[shipping_method]": "",
      });
    }

    if (this.props.customer && !prevProps.customer) {
      this.updateCustomerFromRedux();
    }
  }

  /**
   * Uses the customer provided by redux and updates local state with customer detail (if present)
   */
  updateCustomerFromRedux() {
    // Pull the customer object from prop (provided by redux)
    const { customer } = this.props;

    // Exit early if the customer doesn't exist
    if (!customer) {
      return;
    }

    // Build a some new state to use with "setState" below
    const newState = {
      "customer[email]": customer.email,
      "customer[id]": customer.id,
    };

    if (customer.firstname) {
      newState.firstName = customer.firstname;
      newState["shipping[name]"] = customer.firstname;
    }

    if (customer.lastname) {
      newState.lastName = customer.lastname;

      // Fill in the rest of the full name for shipping if the first name was also available
      if (customer.firstname) {
        newState["shipping[name]"] += ` ${customer.lastname}`;
      }
    }

    this.setState(newState);
  }

  redirectOutOfCheckout() {
    this.props.router.push("/");
  }

  handleChangeForm(e) {
    // update form's input by name in state
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  /**
   * Handle a successful `checkout.capture()` request
   *
   * @param {object} result
   */
  handleCaptureSuccess(result) {
    this.props.router.push("/checkout/confirm");
  }

  /**
   * Handle an error during a `checkout.capture()` request
   *
   * @param {object} result
   */
  handleCaptureError(result) {
    // Clear the initial loading state
    this.setState({ loading: false });

    let errorToAlert = "";

    // If errors are passed as strings, output them immediately
    if (typeof result === "string") {
      alert(result);
      return;
    }

    const {
      data: { error = {} },
    } = result;

    // Handle any validation errors
    if (error.type === "validation") {
      console.error("Error while capturing order!", error.message);

      if (typeof error.message === "string") {
        alert(error.message);
        return;
      }

      error.message.forEach(({ param, error }, i) => {
        this.setState({
          errors: {
            ...this.state.errors,
            [param]: error,
          },
        });
      });

      errorToAlert = messageStack.reduce((string, error) => {
        return `${string} ${error.error}`;
      }, "");
    }

    // Handle internal errors from the Chec API
    if (["gateway_error", "not_valid", "bad_request"].includes(error.type)) {
      this.setState({
        errors: {
          ...this.state.errors,
          [error.type === "not_valid" ? "fulfillment[shipping_method]" : error.type]: error.message,
        },
      });
      errorToAlert = error.message;
    }

    // Surface any errors to the customer
    if (errorToAlert) {
      alert(errorToAlert);
    }
  }

  /**
   * Capture the order
   *
   * @param {Event} e
   */
  captureOrder(e) {
    e.preventDefault();

    // reset error states
    this.setState({
      errors: {
        "fulfillment[shipping_method]": null,
        gateway_error: null,
        "shipping[name]": null,
        "shipping[street]": null,
      },
    });

    // set up line_items object and inner variant object for order object below
    /*const line_items = this.props.checkout.live.line_items.reduce((obj, lineItem) => {
      const variants = lineItem.variants.reduce((obj, variant) => {
        obj[variant.variant_id] = variant.option_id;
        return obj;
      }, {});
      obj[lineItem.id] = { ...lineItem, variants };
      return obj;
    }, {});*/

    // construct order object
    const newOrder = {
      line_items,
      customer: {
        firstname: this.state.firstName,
        lastname: this.state.lastName,
        email: this.state["customer[email]"],
      },
      // collected 'order notes' data for extra field configured in the Chec Dashboard
      extrafields: {
        extr_j0YnEoqOPle7P6: this.state.orderNotes,
      },
      // Add more to the billing object if you're collecting a billing address in the
      // checkout form. This is just sending the name as a minimum.
      billing: {
        name: `${this.state.firstName} ${this.state.lastName}`,
      },
      shipping: {
        name: this.state["shipping[name]"],
      },
      fulfillment: {
        shipping_method: this.state["fulfillment[shipping_method]"],
      },
    };

    // If test gateway selected add necessary card data for the order to be completed.
    if (this.state.selectedGateway === "test_gateway") {
      this.setState({
        loading: true,
      });

      newOrder.payment.card = {
        number: this.state.cardNumber,
        expiry_month: this.state.expMonth,
        expiry_year: this.state.expYear,
        cvc: this.state.cvc,
        postal_zip_code: this.state.billingPostalZipcode,
      };
    }

    // Capture the order
    /* this.props.dispatchCaptureOrder(this.props.checkout.id, newOrder)
      .then(this.handleCaptureSuccess)
      .catch(this.handleCaptureError);*/
  }

  isNotCartEmpty(cart) {
    return cart && cart.total_items !== 0;
  }

  recountCartPrices(customer, products, cart, selectedShippingOption) {
    const customerDiscounts = customer.external_id.split("-");
    let subtotal = 0;
    if (this.isNotCartEmpty(cart)) {
      cart.line_items.map((item) => {
        const product = products.find((product) => product.id === item.product_id);
        const category = product.categories[0].slug;
        const discountPercentage = customerDiscounts[category];
        const discountPrice = product.price.formatted * (1 - discountPercentage / 100);
        const totalDiscountPrice = item.quantity * discountPrice;

        item.discountPercentage = discountPercentage;
        item.discountPrice = discountPrice;
        item.line_total.formatted = totalDiscountPrice;
        subtotal += totalDiscountPrice;
        return item;
      });
      const taxPrice = Math.round(subtotal * 0.21);
      const totalSum = Math.round(subtotal + Number(taxPrice) + Number(selectedShippingOption.price));
      cart.subtotal.formatted = subtotal;
      cart.taxPrice = taxPrice;
      cart.totalSum = totalSum;
    }
  }

  handleSubmit = (e) => {
    const encode = (data) => {
      return Object.keys(data)
          .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
          .join("&");
    }
    const items = this.props.cart.line_items.map(item => {
      return {
        product: item.product_name, 
        quantity: item.quantity,
        originalPrice: item.price.raw, 
        discountPrice: item.discountPrice,
        discountPercentage: item.discountPercentage,
        total: item.line_total.formatted
      }
    });
    const body = {
      formName: "order",
      name: this.state.firstName,
      address: this.state.lastName,
      ico: this.state.ico,
      dic: this.state.dic,
      phone: this.state.phone,
      cart: {
        taxes: this.props.cart.taxPrice,
        totalPriceWithTaxes: this.props.cart.totalSum,
        items: items
      },
      shippingMethod: this.state["fulfillment[shipping_method]"]
    };
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({ "form-name": "order", ...this.state })
    })
      .then(() => alert("Success!"))
      .catch(error => alert(error));
      
    e.preventDefault();
  };

  render() {
    const { customer, products, cart } = this.props;
    if (customer && this.isNotCartEmpty(cart)) {
      const selectedShippingOption = PAYNMENT_METHODS.find(
        ({ id }) => id === this.state["fulfillment[shipping_method]"]
      );
      this.recountCartPrices(customer, products, cart, selectedShippingOption);
      if (this.state.loading) {
        return <Loader />;
      }
      return (
        <Root>
          <Head>
            <title>Objednávka</title>
          </Head>
          <form name="order" method="POST" data-netlify="true" onSubmit={this.handleSubmit} onChange={this.handleChangeForm} hidden>
                    <input type="hidden" name="form-name" value="order" />
                    {/* ShippingDetails */}
                    <p className="font-size-subheader font-weight-semibold mb-4">
                      Fakturační údaje
                    </p>
                    <div className="mb-5">
                      <ShippingForm
                        firstName={this.state.firstName}
                        lastName={this.state.lastName}
                        customerEmail={this.state["customer[email]"]}
                        shippingOptions={PAYNMENT_METHODS}
                        selectedShippingOptionId={this.state["fulfillment[shipping_method]"]}
                        selectedShippingOption={selectedShippingOption}
                        shippingStreet={this.state["shipping[street]"]}
                        shippingTownCity={this.state["shipping[town_city]"]}
                        shippingPostalZipCode={this.state["shipping[postal_zip_code]"]}
                        orderNotes={this.state.orderNotes}
                      />
                    </div>

                    <p className="checkout-error">
                      {!selectedShippingOption ? "Vyberte platební metodu!" : ""}
                    </p>
                    {customer ? (
                      <button
                        type="submit"
                        className="bg-black font-color-white w-100 border-none h-56 font-weight-semibold d-none d-lg-block checkout-btn"
                        disabled={!selectedShippingOption}
                      >
                        Odeslat objednávku
                      </button>
                    ) : null}
                  </form>
          <div className="custom-container py-5 my-4 my-sm-5">
            {/* Row */}
            <div className="row mt-4">
              <div className="col-12 col-md-10 col-lg-6 offset-md-1 offset-lg-0">
                {/* Breadcrumbs */}
                <div className="d-flex pb-4 breadcrumb-container">
                  <Link href="/collection">
                    <div className="font-size-caption text-decoration-underline cursor-pointer">
                      Obchod
                    </div>
                  </Link>
                  <img src="/icon/arrow-right.svg" className="w-16 mx-1" alt="Arrow icon" />
                  <div className="font-size-caption font-weight-bold cursor-pointer">
                    Objednávka
                  </div>
                </div>
                {this.isNotCartEmpty(cart) && (
                 <form name="order" method="POST" data-netlify="true" onSubmit={this.handleSubmit} onChange={this.handleChangeForm}>
                    <input type="hidden" name="form-name" value="order" />
                    {/* ShippingDetails */}
                    <p className="font-size-subheader font-weight-semibold mb-4">
                      Fakturační údaje
                    </p>
                    <div className="mb-5">
                      <ShippingForm
                        firstName={this.state.firstName}
                        lastName={this.state.lastName}
                        customerEmail={this.state["customer[email]"]}
                        shippingOptions={PAYNMENT_METHODS}
                        selectedShippingOption={selectedShippingOption}
                        ico={this.state.ico}
                        phone={this.state.phone}
                        dic={this.state.dic}
                        orderNotes={this.state.orderNotes}
                      />
                    </div>

                    <p className="checkout-error">
                      {!selectedShippingOption ? "Vyberte platební metodu!" : ""}
                    </p>
                    {customer ? (
                      <button
                        type="submit"
                        className="bg-black font-color-white w-100 border-none h-56 font-weight-semibold d-none d-lg-block checkout-btn"
                        disabled={!selectedShippingOption}
                      >
                        Odeslat objednávku
                      </button>
                    ) : null}
                  </form>
                )}
              </div>

              <div className="col-12 col-lg-5 col-md-10 offset-md-1">
                <div className="bg-brand200 p-5 checkout-summary">
                  <div className="borderbottom font-size-subheader border-color-gray400 pb-2 font-weight-medium">
                    Souhrn objednávky
                  </div>
                  <div className="pt-3 borderbottom border-color-gray400">
                    {(this.isNotCartEmpty(cart) ? cart.line_items : []).map((item) => {
                      return (
                        <div key={item.id} className="d-flex mb-2">
                          {item && item.media && (
                            <img
                              className="checkout__line-item-image mr-2"
                              src={item.media.source}
                              alt={item.product_name}
                            />
                          )}
                          <div className="d-flex flex-grow-1">
                            <div className="flex-grow-1">
                              <p className="font-weight-medium">{item.product_name}</p>
                              <p className="font-color-light">Počet ks: {item.quantity}</p>
                            </div>
                            <div className="text-right font-weight-semibold">
                              {item.line_total.formatted} Kč
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="py-3 borderbottom border-color-black">
                    {[
                      {
                        name: "Mezisoučet",
                        amount: this.isNotCartEmpty(cart) ? cart.subtotal.formatted + " Kč" : "",
                      },
                      {
                        name: "DPH 21%",
                        amount: this.isNotCartEmpty(cart) ? cart.taxPrice + " Kč" : "",
                      },
                      {
                        name: "Platební metoda",
                        amount: selectedShippingOption
                          ? `${selectedShippingOption.id} - ${selectedShippingOption.price}` + " Kč"
                          : "Nic nebylo vybráno",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center mb-2"
                      >
                        <p>{item.name}</p>
                        <p className="text-right font-weight-medium">{item.amount}</p>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2 pt-3">
                    <p className="font-size-title font-weight-semibold">Celkově</p>
                    <p className="text-right font-weight-semibold font-size-title">
                      {this.isNotCartEmpty(cart) ? cart.totalSum : ""} Kč
                    </p>
                  </div>

                  {customer ? (
                    <button
                      type="submit"
                      className="bg-black mt-4 font-color-white w-100 border-none h-56 font-weight-semibold d-lg-none"
                      onClick={this.handleSubmit}
                      disabled={!selectedShippingOption}
                    >
                      Odeslat objednávku
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Root>
      );
    } else {
      return <h4>Pouze pro registrované!</h4>;
    }
  }
}

CheckoutPage.propTypes = {
  orderReceipt: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  checkout: PropTypes.object,
  cart: PropTypes.object,
  products: PropTypes.array,
  shippingOptions: PropTypes.array,
  dispatchGenerateCheckout: PropTypes.func,
  dispatchGetShippingOptions: PropTypes.func,
  dispatchSetDiscountCodeInCheckout: PropTypes.func,
};

// If using Stripe, this provides context to the page so we can use `stripe` and
// `elements` as props.
const InjectedCheckoutPage = (passProps) => {
  return (
    <Elements stripe={passProps.stripe}>
      <ElementsConsumer>
        {({ elements, stripe }) => (
          <CheckoutPage {...passProps} stripe={stripe} elements={elements} />
        )}
      </ElementsConsumer>
    </Elements>
  );
};

export default withRouter(
  connect(
    ({
      checkout: { checkoutTokenObject, shippingOptions },
      cart,
      customer,
      orderReceipt,
      products,
    }) => ({
      checkout: checkoutTokenObject,
      customer,
      shippingOptions,
      cart,
      orderReceipt,
      products,
    }),
    {
      dispatchGenerateCheckout,
      dispatchGetShippingOptions,
      dispatchSetShippingOptionsInCheckout,
      dispatchSetDiscountCodeInCheckout,
      dispatchCaptureOrder,
    }
  )(InjectedCheckoutPage)
);
