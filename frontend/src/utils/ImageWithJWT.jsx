import React from "react";
import PropTypes from "prop-types";

const dummyImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23eeeeee'/%3E%3C/svg%3E";

function ImageWithJWT({ imageUrl, className, alt }) {
  return (
    <img
      src={imageUrl || dummyImage}
      className={className}
      alt={alt || ""}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = dummyImage;
      }}
    />
  );
}

ImageWithJWT.propTypes = {
  imageUrl: PropTypes.string,
  className: PropTypes.string,
  alt: PropTypes.string,
};

ImageWithJWT.defaultProps = {
  imageUrl: "",
  className: "",
  alt: "",
};

export default ImageWithJWT;
