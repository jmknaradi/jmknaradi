import React, { Component } from 'react';
import Swiper, { EffectFade, Autoplay } from 'react-id-swiper';

const params = {
  modules: [EffectFade, Autoplay],
  slidesPerView: 1,
  watchOverflow: false,
  /*autoplay: {
    delay: 5000
  },*/
  loop: true,
  allowTouchMove: false,
  speed: 1000,
  effect: 'fade',
  fadeEffect: {
    crossFade: true
  }
};
const images = [
  '/images/naradi_porovnane.png'
];

export default class HeroSection extends Component {
  render() {
    return (
      <div className="hero-section position-relative">
        <Swiper {...params}>
          {images.map((image, index) => (
            <div key={image}>
              <div
                className="hero-slide d-flex align-items-centere flex-column font-color-white py-5"
                style={{
                  backgroundImage: `url("${image}")`
                }}
              >
                <p className="font-size-display5 font-family-secondary mb-4 text-center hero-header">
                  Kvalitní zahradní nářadí vyrobené v České republice
                </p>
              </div>
            </div>
          ))}
        </Swiper>
      </div>
    );
  }
}
