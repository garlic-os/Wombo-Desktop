// https://stackoverflow.com/a/47914369
export default (file: File): Promise<File> => {
	return new Promise( (resolve) => {
		const image = new Image();
		image.onload = () => {
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			canvas.width = image.width;
			canvas.height = image.height;
			context.drawImage(image, 0, 0);

			canvas.toBlob( (blob) => {
				resolve(new File([blob], "image.jpg"));
			}, "image/jpeg", 0.98);  // Quality: 98%
		};
		image.src = URL.createObjectURL(file);
	});
};
