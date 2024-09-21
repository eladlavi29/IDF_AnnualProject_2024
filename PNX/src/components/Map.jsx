import React from "react";
import background from "../images/temp_map.png";

const Map = ({children}) => {
  return (
    <div style={{ backgroundImage: `url(${background})`,
    backgroundSize: "cover",
    height: 940,
    backgroundRepeat: "no-repeat" }}>
      {children}
    </div>
  );
}

export default Map;