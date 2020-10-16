const Mask = {
    apply(input, func) {
        setTimeout(() => {
            input.value = Mask[func](input.value);
        }, 1);
    },

    formatBRL(value) {

        value = value.replace(/\D/g, '');

        return value = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100);
    },

    cpfCnpj(value) {
        value = value.replace(/\D/g, '');

        if (value.length > 14) {
            value = value.slice(0, -1);
        };
        
        // CHECK IF IS CPF OR CNPJ

        if (value.length > 11) {
            // CNPJ
            value = value.replace(/(\d{2})(\d)/, '$1.$2');

            value = value.replace(/(\d{3})(\d)/, '$1.$2');

            value = value.replace(/(\d{3})(\d)/, '$1/$2');
            
            value = value.replace(/(\d{4})(\d)/, '$1-$2');

        } else {
            // CPF
            value = value.replace(/(\d{3})(\d)/, '$1.$2');

            value = value.replace(/(\d{3})(\d)/, '$1.$2');

            value = value.replace(/(\d{3})(\d)/, '$1-$2');

        };

        return value;
    },

    cep(value) {
        value = value.replace(/\D/g, '');

        if (value.length > 8) {
            value = value.slice(0, -1);
        };

        value = value.replace(/(\d{5})(\d)/, '$1-$2');

        return value;
    },
};

const photosUpload = {
    input: "",
    uploadLimit: 6,
    preview: document.querySelector('#photos-preview'),
    files: [],
    handleFileInput(event) {
        const { files: fileList } = event.target;
        photosUpload.input = event.target;

        if (photosUpload.hasLimit(event)) return;

        Array.from(fileList).forEach(file => {

            photosUpload.files.push(file);

            const reader = new FileReader();

            reader.onload = () => {
                const image = new Image();
                image.src = String(reader.result);

                const div = photosUpload.getContainer(image);
                photosUpload.preview.appendChild(div);
            };

            reader.readAsDataURL(file);
        });

        photosUpload.input.files = photosUpload.getAllFiles();
    },
    hasLimit(event) {
        const { uploadLimit, input, preview } = photosUpload;
        const { files: fileList } = input;

        if (fileList.length > uploadLimit) {
            alert(`Por favor, envie no máximo ${uploadLimit} fotos!`);
            event.preventDefault();
            return true;
        };

        const photosDiv = [];
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == 'photo') {
                photosDiv.push(item);
            };
        });

        const totalPhotos = fileList.length + photosDiv.length;
        if (totalPhotos > uploadLimit) {
            alert('Você atingiu o limite máximo de Fotos.')
            event.preventDefault();
            return true;
        };

        return false;
    },
    getAllFiles() {
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer();

        photosUpload.files.forEach(file => dataTransfer.items.add(file));

        return dataTransfer.files;
    },
    getContainer(image) {
        const div = document.createElement('div');
        div.classList.add('photo');

        div.onclick = photosUpload.removePhoto;

        div.appendChild(image);
        
        div.appendChild(photosUpload.getRemoveButton());

        return div;
    },
    getRemoveButton() {
        const button = document.createElement('i');
        button.classList.add('material-icons');
        button.innerHTML = 'close';
        return button;
    },
    removePhoto(event) {
        const photoDiv = event.target.parentNode;
        const photosArray = Array.from(photosUpload.preview.children);
        const index = photosArray.indexOf(photoDiv);

        photosUpload.files.splice(index, 1);
        photosUpload.input.files = photosUpload.getAllFiles();

        photoDiv.remove();
    },
    removeOldPhoto() {
        const photoDiv = event.target.parentNode;
        
        if (photoDiv.id) {
            const removedFiles = document.querySelector('input[name="removed_files"]');
            if (removedFiles) {
                removedFiles.value += `${photoDiv.id},`;
            };
        };

        photoDiv.remove();
    },
};

const imageGallery = {
    highlight: document.querySelector('.gallery .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(e) {
        const { target } = e;

        imageGallery.previews.forEach(preview => {
            preview.classList.remove('active');
        });

        target.classList.add('active');

        imageGallery.highlight.src = target.src;
        Lightbox.image.src = target.src;
    },
};

const Lightbox = {
    target: document.querySelector('.lightbox-target'),
    image: document.querySelector('.lightbox-target img'),
    closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
    open() {
        Lightbox.target.style.opacity = 1;
        Lightbox.target.style.top = 0;
        Lightbox.target.style.bottom = 0;
        Lightbox.closeButton.style.top = 0;
    },
    close() {
        Lightbox.target.style.opacity = 1;
        Lightbox.target.style.top = '-100%';
        Lightbox.target.style.bottom = 'initial';
        Lightbox.closeButton.style.top = '-80px';
    },
};

const Validate = {
    apply(input, func) {
        Validate.clearErrors();
        let results = Validate[func](input.value);
        input.value = results.value;

        if (results.error) {
            Validate.displayError(input, results.error);
            input.focus();
        };
    },

    isEmail(value) {
        let error = null;

        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        if (!value.match(mailFormat)) {
            error = 'E-mail Inválido!';
        };

        return {
            error,
            value,
        };
    },

    displayError(input, error) {
        const div = document.createElement('div');
        div.classList.add('error');
        div.innerHTML = error;

        input.parentNode.appendChild(div);
        input.focus()
    },

    clearErrors() {
        const divError = document.querySelector('.error');
        
        if (divError) {
            divError.remove();
        };
    },

    isCpfCnpj(value) {
        let error = null;
        let cleanValues = value

        cleanValues = cleanValues.replace(/\D/g, '');

        if (cleanValues.length > 11 && cleanValues.length !== 14) {
            error = 'CNPJ Inválido!';
        } else if (cleanValues.length < 12 && cleanValues.length !== 11) {
            error = 'CPF Inválido!';
        };

        return {
            error,
            value,
        };
    },

    isCep(value) {
        let error = null;
        let cleanValues = value

        cleanValues = cleanValues.replace(/\D/g, '');

        if (cleanValues.length < 8) {
            error = 'CEP Inválido!';
        };

        return {
            error,
            value,
        };
    },

    allFields(e) {
        const items = document.querySelectorAll('.item input, .item select, .item textarea');

        for (item of items) {
            if (item.value == '') {
                const message = document.createElement('div');
                message.classList.add('messages');
                message.classList.add('error');
                message.style.position = 'fixed';
                message.innerHTML = 'Todos os Campos são obrigatórios, favor preenchê-los antes de enviar.'
                document.querySelector('body').append(message);

                e.preventDefault();
                break;
            };
        };
    },
};