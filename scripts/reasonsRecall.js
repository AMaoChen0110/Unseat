function showGallery(galleryId) {
    document.getElementById("reason1").style.display = galleryId === 'reason1' ? 'flex' : 'none';
    document.getElementById("reason2").style.display = galleryId === 'reason2' ? 'flex' : 'none';
}