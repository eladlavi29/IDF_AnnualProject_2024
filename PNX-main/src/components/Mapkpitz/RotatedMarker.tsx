import { Marker } from "react-leaflet";
import "leaflet-rotatedmarker";
import React, { forwardRef, useEffect, useRef } from "react";

interface RotatedMarkerProps extends React.ComponentProps<typeof Marker> {
  rotationAngle: number;
  rotationOrigin: string;
}

const RotatedMarker = forwardRef(
  (
    { children, rotationAngle, rotationOrigin, ...props }: RotatedMarkerProps,
    forwardRef
  ) => {
    const markerRef: React.MutableRefObject<any> = useRef();

    useEffect(() => {
      const marker = markerRef.current;
      if (marker) {
        marker.setRotationAngle(rotationAngle);
        marker.setRotationOrigin(rotationOrigin);
      }
    }, [rotationAngle, rotationOrigin]);

    return (
      <Marker
        ref={(ref) => {
          markerRef.current = ref;

          if (forwardRef) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            forwardRef.current = ref;
          }
        }}
        {...props}
      >
        {children}
      </Marker>
    );
  }
);

export default RotatedMarker;
