import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropdown from "../../common/atoms/Dropdown";

export default class ShippingForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      receiveNewsletter: true,
      saveInfo: true,
    };
  }

  render() {
    const {
      shippingOptions,
      selectedShippingOption,
      firstName,
      lastName,
      shippingTownCity,
      shippingStreet,
      shippingPostalZipCode,
      customerEmail,
      orderNotes,
    } = this.props;
    return (
      <>
        <div className="row">
          <div className="col-12 col-sm-4 mb-3">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">Název firmy*</p>
              <input name="firstName" value={firstName} className="rounded-0 w-100" />
            </label>
          </div>
          <div className="col-12 col-sm-4 mb-3">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">IČO*</p>
              <input
                name="shipping[street]"
                value={shippingStreet}
                className="rounded-0 w-100"
              />
            </label>
          </div>
          <div className="col-12 col-sm-4 mb-3">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">DIČ (volitelné)</p>
              <input name="dic" className="rounded-0 w-100" />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-sm-12 mb-12">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">Adresa*</p>
              <input name="lastName" value={lastName} className="rounded-0 w-100" />
            </label>
          </div>
        </div>
        <div className="row my-2">
          <div className="col-12 col-sm-6 mb-3">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">Telefonní číslo</p>
              <input name="phone" className="rounded-0 w-100" />
            </label>
          </div>
          <div className="col-12 col-sm-6 mb-3">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">Emailová adresa*</p>
              <input name="customer[email]" value={customerEmail} className="rounded-0 w-100" />
            </label>
          </div>
        </div>
        <div className="row">
          <div className="col-12 mb-3">
            <label className="w-100">
              <p className="mb-1 font-size-caption font-color-light">Platební metoda*</p>
              <Dropdown
                name="fulfillment[shipping_method]"
                value={selectedShippingOption ? `${selectedShippingOption.id}` : ""}
                placeholder="Vyberte způsob platby"
              >
                {shippingOptions &&
                  shippingOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {`${option.id}`}
                    </option>
                  ))}
              </Dropdown>
            </label>
          </div>
        </div>
        <label className="w-100 mb-3">
          <p className="mb-1 font-size-caption font-color-light">Poznámka</p>
          <textarea name="orderNotes" value={orderNotes} className="rounded-0 w-100" />
        </label>
      </>
    );
  }
}

ShippingForm.propTypes = {
  shippingOptions: PropTypes.array,
  countries: PropTypes.object,
  subdivisions: PropTypes.object,
  deliveryCountry: PropTypes.string,
  deliveryRegion: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
  selectedShippingOptionId: PropTypes.string,
  selectedShippingOption: PropTypes.object,
  shippingTownCity: PropTypes.string,
  shippingStreet: PropTypes.string,
  shippingStreet2: PropTypes.string,
  shippingPostalZipCode: PropTypes.string,
  customerEmail: PropTypes.string,
  orderNotes: PropTypes.string,
};
