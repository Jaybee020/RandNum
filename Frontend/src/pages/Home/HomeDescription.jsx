import { Fragment, useEffect } from "react";
import random from "canvas-sketch-util/random";
import Icon from "../../components/common/Icon";

const HomeDescription = () => {
  let time = Date.now();

  const updateLines = () => {
    const currTime = Date.now();
    const delta = currTime - time;

    [
      ...document.getElementsByClassName("footer__line-animation__row__item"),
    ].forEach((el, ind) => {
      const element = el.getBoundingClientRect();
      const x = element.left;
      const y = element.top;

      const n = random.noise3D(x, y, delta * 0.07, 0.0024);
      const angle = n * Math.PI * 0.6;

      var transform = "rotate(" + angle + "rad)";
      el.style.transform = transform;
    });

    requestAnimationFrame(updateLines);
  };

  useEffect(() => {
    updateLines();
  }, []);

  return (
    <div className="home-page__description">
      <div className="home-page__description__header">
        <div className="logo">
          <Icon.Logo />
        </div>
      </div>

      <div className="home-page__description__content">
        <h2 className="home-page__description__content__title">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Magnam
          voluptatem.
        </h2>
        <p className="home-page__description__content__subtitle">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
          ipsa repellat, in, maiores quibusdam.
        </p>

        <div className="home-page__description__content__buttons">
          <button>
            <Icon.Scroll />
            <p>Bets history</p>
          </button>
          <button>
            <Icon.Strategy />
            <p>Join current bet</p>
          </button>
        </div>
      </div>

      <div className="home-page__description__footer">
        <div className="footer__line-animation">
          {[...Array(4).keys()].map(i => (
            <div key={i} className="footer__line-animation__row">
              <Fragment key={i}>
                {[...Array(18).keys()].map(j => (
                  <div
                    className="footer__line-animation__row__item"
                    key={j}
                  ></div>
                ))}
              </Fragment>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeDescription;
