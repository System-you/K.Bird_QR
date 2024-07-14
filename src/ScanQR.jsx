"use client";
import React, { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const Page = () => {
  useEffect(() => {
    function onScanSuccess(decodedText, decodedResult) {
      // handle the scanned code as you like, for example:
      window.location.assign(decodedText)
    }

    function onScanFailure(error) {
      // handle scan failure, usually better to ignore and keep scanning.
      // for example:
      console.warn(`Code scan error = ${error}`);
    }

    const htmlScanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      true
    );

    htmlScanner.render(onScanSuccess, onScanFailure);

    return ()=>{
        htmlScanner.clear();
    }
  }, []);
  return (
    <div className="w-full h-svh flex flex-col items-center justify-self-center">
      <div id="reader" className="w-[600px]"></div>
    </div>
  );
};

export default Page;