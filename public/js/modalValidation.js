const modalButton = document.getElementById("modal-button");
const titleInput = document.getElementById("playlist-title").value;

window.onload = () => {
  console.log("hola");
};
titleInput.onchange = () => {
  console.log(titleInput);

  if (titleInput) {
    modalButton.disabled = false;
  }
};
