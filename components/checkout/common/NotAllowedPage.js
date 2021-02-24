import React, { Component } from 'react';
import Link from 'next/link';
import Root from "../../common/Root";

export default class NotAllowedPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {  
    return (
      <Root>
        <div className="pt-5 mt-2">
          {/* Row */}
          <div className="row mt-4">
            <div className="col-12 col-md-12 col-lg-12 offset-md-1 offset-lg-0">
              <div className="h-100 d-flex flex-column align-items-center justify-content-center py-5 px-4 px-sm-5">
                <div className="bg-success700 h-64 w-64 d-flex rounded-circle align-items-center justify-content-center mb-4">
                  <img src="/icon/cross.svg" className="w-40" />
                </div>
                <h3 className="text-center font-family-secondary mb-3">
                  Nepovolený přístup!
                </h3>
                <div className="d-flex w-100 justify-content-center flex-column flex-sm-row">
                  <Link href="/">
                    <button className="checkout-confirm-buttons h-48 px-3 flex-grow-1 border bg-white border-color-gray500 font-color-light mb-2 mb-sm-0 mr-sm-2 no-print">
                      Zpátky do obchodu
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Root>
    );
  }
}
