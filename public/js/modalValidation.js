const modalButton = document.getElementById("modal-button");
const titleInput = document.getElementById("playlist-title");

titleInput.onkeyup = () => { // comprueba cada vez que tecleamos, si el imput se completa, el botón de create se activa
  if (titleInput.value !== "") {
    modalButton.disabled = false;
  } else {
    modalButton.disabled = true;
  }
};
