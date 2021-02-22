import React from "react";

const Footer = () => (
  <footer className="pt-5">
    <form name="order" data-netlify="true" hidden>
      <input type="hidden" name="form-name" value="order" />
      <input name="firstName" />
      <input name="ico" />
      <input name="dic" />
      <input name="lastName" />
      <input name="phone" />
      <input name="customerEmail]" />
      <select name="shippingMethod"></select>
      <textarea name="orderNotes" />
      <input name="taxPrice" />
      <input name="totalPriceWithTaxes" />
      <input name="items" />
    </form>
    <div className="custom-container mb-5 pb-5 pt-5" style={{display: "none"}}>
      <div className="row">
        <div className="col-12 col-sm-6 col-md-4">
          <p className="font-family-secondary font-size-display1 mb-4">Kde lze nakoupit</p>
          <div className="d-flex font-color-medium mb-5 pb-3 pb-md-0 mb-md-0">
            <div className="pr-5"></div>
            <div></div>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-4">
          <p className="font-family-secondary font-size-display1 mb-4"></p>
          <div className="d-flex font-color-medium mb-5 pb-3 pb-md-0 mb-md-0">
            <div className="pr-5"></div>
            <div></div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <p className="font-family-secondary font-size-display1 mb-3"></p>
          <div className="position-relative"></div>
        </div>
      </div>
    </div>
    <div className="custom-container my-0">
      <p className="font-family-secondary font-size-display1 mb-4">Kontaktujte nás</p>
      <div class="row">
        <div class="col-md-6 col12">
          <form name="contact" method="POST" data-netlify="true">
            <input type="hidden" name="form-name" value="contact" />
            <div className="row my-2 col-12 col-md-12">
              <input type="email" name="email" className="w-100" placeholder="Váš email" required />
            </div>
            <div className="row my-2 col-12 col-md-12">
              <input
                type="text"
                name="subject"
                className="w-100"
                placeholder="Předmět zprávy"
                required
              />
            </div>
            <div className="row my-2 col-12 col-md-12">
              <textarea
                name="body"
                rows="2"
                className="w-100 mb-2"
                placeholder="Vaše zpráva"
                required
              />
            </div>
            <div className="row my-2">
              <button type="submit" className="btn btn-primary mb-4">
                Odeslat
              </button>
            </div>
          </form>
        </div>
        <div class="col-12 my-4 col-md-6">
          <div class="row address-header">
            <h5>JMK služby s. r. o.</h5>
          </div>
          <div class="row address-contact">Vojtěchov 150, 539 01 Hlinsko</div>
          <div class="row address-contact">+420 722 016 026</div>
          <div class="row address-contact">
            <a href="mailto:jmk@jmksluzby.cz">jmk@jmksluzby.cz</a>
          </div>
          <div class="row address-contact">IČO: 08494436</div>
          <div class="row address-contact">DIČ: CZ08494436</div>
        </div>
      </div>
    </div>
    <div className="pt-md-2">
      <div className="bg-brand300">
        <div className="custom-container d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="pt-5 pb-0 pt-md-4 pb-md-4 d-flex align-items-center flex-wrap justify-content-center">
            <p className="px-2 font-color-brand font-size-caption"></p>
            <p className="px-2 font-color-brand font-size-caption"></p>
          </div>
          <div className="font-color-brand font-size-caption py-4 text-right">
            &copy; {new Date().getFullYear()} JMKnářadí.cz.
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
