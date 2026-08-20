import Script from "next/script";

export function ConsentScripts() {
  const settingsId = process.env.NEXT_PUBLIC_USERCENTRICS_SETTINGS_ID;
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (!settingsId) return null;

  return (
    <>
      <Script
        id="usercentrics-cmp"
        src="https://app.usercentrics.eu/browser-ui/latest/loader.js"
        data-settings-id={settingsId}
        strategy="afterInteractive"
      />
      {ga4Id ? (
        <>
          <Script
            id="ga4-library"
            type="text/plain"
            data-usercentrics="Google Analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <Script
            id="ga4-configuration"
            type="text/plain"
            data-usercentrics="Google Analytics"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`}</Script>
        </>
      ) : null}
      {metaPixelId ? (
        <Script
          id="meta-pixel"
          type="text/plain"
          data-usercentrics="Meta Pixel"
        >{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}</Script>
      ) : null}
    </>
  );
}
