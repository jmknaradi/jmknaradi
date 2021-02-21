import React, { Component } from "react";
import ReviewStars from "./ReviewStars";
import VariantSelector from "../productAssets/VariantSelector";
import { animateScroll as scroll } from "react-scroll";
import { connect } from "react-redux";
import { addToCart } from "../../store/actions/cartActions";

class ProductDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOptions: [],
      amount: 1,
    };

    this.handleAddToCart = this.handleAddToCart.bind(this);
    this.handleReviewClick = this.handleReviewClick.bind(this);
    this.handleSelectOption = this.handleSelectOption.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.setSelectedOptions();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.product || prevProps.product.id !== this.props.product.id) {
      // Product was changed, reset selected variant options
      this.setSelectedOptions();
    }
  }

  /**
   * Work out which options should be selected by which variants
   */
  setSelectedOptions() {
    this.setState((state, props) => ({
      selectedOptions: {
        // Assign the first option as the selected value for each variant
        ...props.product.variants.reduce(
          (acc, variant) => ({
            ...acc,
            [variant.id]: variant.options[0].id,
          }),
          {}
        ),
      },
    }));
  }

  /**
   * Handle click to scroll to review section
   */
  handleReviewClick() {
    const section = document.querySelector("#reviews");

    if (section) {
      scroll.scrollTo(section.offsetTop - 130, {
        smooth: "easeInOutQuint",
      });
    }
  }

  /**
   * On selecting variant
   */
  handleSelectOption(variantId, optionId) {
    this.setState({
      selectedOptions: {
        ...this.state.selectedOptions,
        [variantId]: optionId,
      },
    });
  }

  /**
   * Get price of selected option
   */
  getPrice() {
    const {
      price: { raw: base },
      variants,
    } = this.props.product;
    const { selectedOptions } = this.state;

    if (!selectedOptions || typeof selectedOptions !== "object") {
      return base;
    }

    const options = Object.entries(selectedOptions);
    return (
      base +
      options.reduce((acc, [variant, option]) => {
        const variantDetail = variants.find((candidate) => candidate.id === variant);
        if (!variantDetail) {
          return acc;
        }
        const optionDetail = variantDetail.options.find((candidate) => candidate.id === option);
        if (!optionDetail) {
          return acc;
        }

        return acc + optionDetail.price.raw;
      }, 0)
    );
  }

  /**
   * Add to Cart
   */
  handleAddToCart(event) {
    const { product } = this.props;
    const { selectedOptions } = this.state;
    this.props.dispatch(addToCart(product.id, this.state.amount, selectedOptions));
    event.preventDefault();
  }

  handleChange(event) {
    this.setState({ amount: event.target.value });
  }

  cartFunctions(customer, product) {
    if (customer) {
      const discounts = this.getDiscounts(customer);
      const productPrice = product.price.raw * (1 - (discounts[product.categories[0].slug] / 100));  
      return (
        <div className="d-flex py-4">
          {}
          <form onSubmit={this.handleAddToCart}>
            <div className="row">
              <div className="col-12 col-sm-12 mb-3"><h5><b>Vaše cena: {productPrice} Kč</b></h5></div>
            </div>
            <div className="row my-2">
              <div className="col-12 col-sm-12 mb-12">
                <label className="mx-2">Počet ks: </label>
                <input
                  className="col-4 col-sm-6 mb-2"
                  type="number"
                  name="amount"
                  value={this.state.amount}
                  onChange={this.handleChange}
                />
              </div>
            </div>
            <div className="row mr-2">
              <div className="col-12 col-sm-12 mb-12">
                <input
                  className="col-11 col-sm-11 mb-2 h-56 bg-black font-color-white"
                  type="submit"
                  value="Přidat do košíku"
                />
              </div>
            </div>
          </form>
        </div>
      );
    } else {
      return null;
    }
  }

  getDiscounts(customer) {
    return customer.external_id.split("-");
  }

  render() {
    const { product } = this.props;
    const { customer } = this.props;
    const { name, description } = product;
    const reg = /(<([^>]+)>)/gi;

    return (
      <div>
        {/* Product Summary */}
        <p className="font-size-display3 font-family-secondary mt-2 mb-2">{name}</p>
        <div className="mb-4 pb-3 font-size-subheader">{(description || "").replace(reg, "")}</div>

        {/* Add to Cart & Price */}
        {this.cartFunctions(customer, product)}
      </div>
    );
  }
}

export default connect((state) => state)(ProductDetail);
