const temperatureSlider = document.querySelector(".nn-temperature-slider");
const temperatureValue = document.querySelector(".nn-temperature-value");
const styleDropdown = document.querySelector(".nn-style-dropdown");
const lengthDropdown = document.querySelector(".nn-length-dropdown");
const applyButton = document.querySelector(".nn-apply-button");

// get from storage
chrome.storage.local.get(["temperature", "style", "length"], (result) => {
  temperatureSlider.value = result.temperature || 0.75;
  temperatureValue.innerHTML = result.temperature || 0.75;
  styleDropdown.value = result.style || "personal";
  lengthDropdown.value = result.length || "medium";
});

temperatureSlider.addEventListener("input", () => {
  temperatureValue.innerHTML = temperatureSlider.value;
});

// When clicking element with class .nn-apply-button display alert box with new values and set in storage
applyButton.addEventListener("click", () => {
  chrome.storage.local.set({
    temperature: temperatureSlider.value,
    style: styleDropdown.value,
    length: lengthDropdown.value,
  });
  alert(
    `New values: temperature: ${temperatureSlider.value}, style: ${styleDropdown.value}, length: ${lengthDropdown.value}`
  );
});
