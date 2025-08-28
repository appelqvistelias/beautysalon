<template>
  <div>
    <div class="hero-container">
      <div class="hero">
        <img class="hero-image" src="../../assets/about-me.jpg" alt="" />
        <div class="hero-overlay"></div>
        <h1>SALONGEN</h1>
      </div>
    </div>
    <div class="information-container">
      <div class="information-section">
        <div class="information-description">
          <div class="title">
            Varmt välkomna till SN Beauty – din skönhetsoas för avkoppling och
            välbefinnande sedan 2021!
          </div>
          <div class="description">
            Här strävar vi efter att få dig att stråla, inifrån och ut. Hos oss
            hittar du en rad behandlingar och tjänster som inte bara förbättrar
            ditt yttre, utan också främjar ditt välmående. Vi skräddarsyr varje
            behandling efter dina unika behov och önskemål för att ge dig den
            bästa möjliga upplevelsen. På SN Beauty är vi mer än bara en
            skönhetssalong – vi är en plats där du kan koppla av och njuta av en
            lyxig stund för dig själv. Följ oss för mer inspiration och boka din
            tid idag! Varmt välkommen till SN Beauty – där din skönhet är vår
            prioritet!
          </div>
        </div>
      </div>
    </div>
    <div class="salon-container">
      <div class="salon-section" id="map">
        <div class="left-section">
          <div class="opening-times">
            <div class="opening-header">ÖPPETTIDER</div>
            <div class="opening-info">Öppet efter tidsbokning</div>
          </div>
          <div class="phone">
            <div class="phone-header">TELEFONNUMMER</div>
            <div class="phone-number">07007699901</div>
          </div>
          <div class="email">
            <div class="email-header">EMAIL</div>
            <div class="email-number">
              <a href="mailto:info@snbeauty.se">info@snbeauty.se</a>
            </div>
          </div>
          <div class="address">
            <div class="address-header">ADDRESS</div>
            <div class="address-info">
              <a
                href="https://www.google.com/maps/place/Vasaplatsen+7B,+411+26+G%C3%B6teborg/@57.6993155,11.9686789,473"
                >VASAGATAN 7B, Göteborg</a
              >
            </div>
          </div>
        </div>

        <div class="map">
          <MapBoxMap
            v-if="apiKey"
            :accessToken="apiKey"
            :center="[11.96867975823242, 57.69932077009476]"
          />
          <GoogleMapFallback v-else />
        </div>
      </div>
      <ContactForm></ContactForm>
    </div>
  </div>
</template>

<script>
import MapBoxMap from "../../components/MapBoxMap.vue";
import ContactForm from "../../components/ContactForm.vue";
import GoogleMapFallback from "../../components/GoogleMapFallback.vue";
export default {
  name: "AboutUsPage",
  components: {
    MapBoxMap,
    ContactForm,
    GoogleMapFallback,
  },
  setup() {
    const apiKey = process.env.VUE_APP_MAPBOX_API_KEY || "";
    return { apiKey };
  },
};
</script>

<style scoped>
.hero-container {
  width: 100%;
  height: 60vh;
}
.hero {
  max-width: 1280px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 100%;
  margin: 0 auto;
}
.hero img {
  object-fit: cover;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: absolute;
}
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}
.hero h1 {
  position: absolute;
  top: 50%;
  right: 50%;
  transform: translate(50%, -50%);
  font-size: 8em;
  font-family: "Playfair Display", serif !important;
  color: white;
  letter-spacing: 4%;
  line-height: 180.78px;
  font-weight: 600;
}

.information-container {
  width: 100%;
}
.information-section,
.salon-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
}
.salon-section {
  display: flex;
  gap: 16px;
  width: 50%;
  padding: 32px 32px 32px 32px;
}
.information-description {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 50%;
  padding: 32px;
}
.left-section,
.map {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: calc(50% - 8px);
}
.information-description .title {
  font-family: "Playfair Display", serif !important;
  letter-spacing: 4%;
  font-size: 2em;
  font-weight: 600;
}
.opening-header,
.phone-header,
.email-header,
.address-header {
  font-family: "Playfair Display", serif !important;
  letter-spacing: 4%;
  font-weight: 600;
}
.phone,
.email,
.address,
.opening-times {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.phone a,
.email a,
.address a,
.opening-times a {
  color: black;
}

@media (max-width: 768px) {
  .hero-container {
    height: 50vh;
  }
  .salon-section {
    width: 100%;
    flex-direction: column;
    gap: 16px;
  }
  .information-description,
  .contact-container {
    width: 100%;
  }
  .hero h1 {
    font-size: 2em;
  }
  .information-description .title {
    font-size: 1.5em;
  }
  .map {
    width: 100%;
  }
}
</style>
