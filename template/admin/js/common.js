function initEditor(selector, options = {}, cb = null, cbUploadImage = null) {
	tinyMCE.init({
		selector,
		plugins: [
			'advlist autolink lists link charmap print preview anchor codesample',
			'searchreplace visualblocks code fullscreen quickbars hr nonbreaking pagebreak',
			'insertdatetime media table paste imagetools wordcount emoticons' // formatpainter powerpaste
		],
		toolbar: 'undo redo | styleselect | bold italic | forecolor backcolor |' +
				'alignleft aligncenter alignright alignjustify |' +
				'outdent indent | numlist bullist | emoticons nonbreaking | fullscreen',
		menubar: 'file edit insert view format table tools custom',
		advlist_bullet_styles: 'default,square,circle,disc',
		quickbars_selection_toolbar: 'bold italic | forecolor backcolor | formatselect | quicklink blockquote',
		quickbars_insert_toolbar: 'nonbreaking | quicktable | numlist bullist | outdent indent | hr pagebreak | emoticons', // quickimage
		menu: {
			custom: { title: 'Lists', items: 'customBulletLine customBulletPlus' }
		},
		nonbreaking_force_tab: true,
		lists_indent_on_tab: true,
		statusbar: true,
		draggable_modal: true,
		branding: false,
		fullscreen_native: true,
		height: 900,
		toolbar_mode: 'floating',
		placeholder: 'Type here...',
		default_link_target: '_blank',
		paste_word_valid_elements: "b,strong,i,em,h1,h2",
		paste_enable_default_filters: false,
		mobile: {
			resize: false
		},
		readOnly: false,
		image: null,
		paste_data_images: false,
		file_picker_callback: function(cb, value, meta){
			let input = document.createElement('input');
			input.setAttribute('type', 'file');
			input.setAttribute('accept', 'image/*');
			let that = this;

			input.onchange = function () {
				let file = this.files[0];
				that.image = file;

				let reader = new FileReader();
				reader.onload = function (e) {
					let id = 'blobid' + (new Date()).getTime();
					let blobCache =  tinymce.activeEditor.editorUpload.blobCache;
					let base64 = reader.result.split(',')[1];
					let blobInfo = blobCache.create(id, file, base64);
					blobCache.add(blobInfo);
					// console.log({ file, blobCache, base64, blobInfo, uri: blobInfo.blobUri() });

					/* call the callback and populate the Title field with the file name */
					cb(blobInfo.blobUri(), { title: file.name, alt: file.name });
				};
				reader.readAsDataURL(file);
			};

			input.click();
			input.remove();
		},
		setup: function(editor){
			editor.on('OpenWindow', e => {
				$('.tox-button[title="Save"]').off('click').on('click', async function() {
					if(e.target.image){
						$(this).prop('disabled', true);
                        const image = e.target.image;

						await addFileToUpload([image], links => {
                            $(this).prop('disabled', false);
                            e.target.windowManager.close();

                            if(links && links.length){
                                const uri = links[0].uri;

                                tinyMCE.activeEditor.execCommand('mceInsertContent', false, `
                                    <img src="${uri}" width="300" height="239" alt=${uri} />
                                `);
                            }

                        })
					}
				})
			})

			editor.on('KeyDown', e => {
				if ((e.keyCode == 8 || e.keyCode == 46) && editor.selection) { // delete & backspace keys
					const selectedNode = editor.selection.getNode(); // get the selected node (element) in the editor

					if (selectedNode && selectedNode.nodeName == 'IMG') {
						// const { src, title, alt } = selectedNode;
					}
				}

				if (e.keyCode === 9) { // tab pressed
					if (e.shiftKey) {
						editor.execCommand('Outdent');
					}else {
						editor.execCommand('Indent');
					}

					e.preventDefault();
					return false;
				}
			});

			editor.ui.registry.addMenuItem('customBulletLine', {
				text: 'Bullet line',
				icon: 'horizontal-rule',
				tooltip: 'Insert Bullet Line',
				onAction: function (_) {
					editor.execCommand('mceInsertContent', false, `<li style="list-style-type: '- '"> </li>`);
				}
			});

			editor.ui.registry.addMenuItem('customBulletPlus', {
				text: 'Bullet plus',
				icon: 'plus',
				tooltip: 'Insert Bullet Plus',
				onAction: function (_) {
					editor.execCommand('mceInsertContent', false, `<li style="list-style-type: '+ '"> </li>`);
				}
			});

			if(cb && {}.toString.call(cb) === '[object Function]'){
				cb(editor);
			}
		},
		...options,
	});
}

function change_alias(alias) {
	let str = alias;
	str = str.toLowerCase();
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
	str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
	str = str.replace(/"/g, '')
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
	str = str.replace(/đ/g,"d");
	str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
	str = str.replace(/ + /g," ");
	str = str.trim(); 
	return str;
}

function convertToSlug(plainText){
	let text_converted_alias = change_alias(plainText);
	let text_split_with_space = text_converted_alias.split(' ');
	let text_joined = text_split_with_space.join('-');

	return text_joined;
}

function changePreviewImage() {
	if (this.files && this.files[0]) {
		let reader = new FileReader();
		reader.onload = function(e) {
			$('#imagePreview').css('background-image', `url('${e.target.result}')`);
			$('#imagePreview').hide();
			$('#imagePreview').fadeIn(650);
		}
		reader.readAsDataURL(this.files[0]);
	}
}

function validEmail(email){
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function debounce(fn, delay, immediate) {
	return function(args){
		clearTimeout(fn.id);
		fn.id = setTimeout(fn.bind(this, args), delay);

		if(immediate){
			clearTimeout(fn.id);
			fn.call(this, args);
		}
	}
}


// =================== UPLOAD S3 ======================= 👀
// ======================= UPLOAD S3 =========================
let arrLinksUploaded = [];
let isDoneUpload = true;
let countDone = 0;

window.onbeforeunload = function() {
	if(!isDoneUpload){
		return isDoneUpload;
	}else{
		return;
	}
};

async function addFileToUpload(multiInput, cbDone = null, cbProgress = null, elementContainer = '') {
	isDoneUpload = false;
	let arrUrlPromise = [];
	let totalFile = 0;

	// Thêm url vào mảng arrUrlPromise
	if(multiInput.length === 1){
		const url = generateLinkS3({ file: multiInput[0] });

        arrUrlPromise = [url];
		totalFile = 1;
	} else {
		for (const input of multiInput) {
            if(input.files && input.files.length){
                for (const file of input.files) {
                    const url = generateLinkS3({ file, type: input.type });
                    arrUrlPromise = [...arrUrlPromise, url];
                    totalFile++;
                }
            }else{
                let url = generateLinkS3({ file: input, type: input.type });
                arrUrlPromise = [...arrUrlPromise, url];
                totalFile++;
            }
		}
	}

	// Generate link S3 -> get list link upload -> upload S3 async
	const listUrl = await Promise.all(arrUrlPromise);
	listUrl.length && listUrl.map(link => {
		const { file, uri, signedUrl, type } = link;
		uploadFileS3({ file, uri, signedUrl, elementContainer, totalFile, type, cbDone, cbProgress });
	})

	return () => listUrl;
}

function generateLinkS3({ file, type = '' }) {
	return new Promise(resolve => {
		const { type: contentType, name: fileName } = file;
		console.log({
			contentType, fileName
		});
		$.get(
			`${location.origin}/generate-link-s3?name=${fileName}&type=${contentType}`, 
			signedUrl => resolve({ 
				signedUrl: signedUrl.linkUpload.data,
				uri: signedUrl.fileName,
				//`https://s3-ap-southeast-1.amazonaws.com/ldk-software.nandio/root/${signedUrl.fileName}`,
				file,
				type
			})
		);
	})
}

// GET LINK FROM SERVER 
function getLinkS3(file) {
	return new Promise(async resolve => {
		try {
			let link;
			await addFileToUpload(file, links => {
				link = links[0].uri;
				if(!link)
					return resolve({ error: true, message: 'fail' });
				return resolve({ error: false, data: link });
			});
			
		} catch (error) {
			return resolve({ error: true, message: error.message });
		}
	})
}

function uploadFileS3({ file, uri, signedUrl, elementContainer, totalFile, type, cbDone, cbProgress }) {
	$.ajax({
		url: signedUrl.url,
		type: 'PUT',
		dataType: 'html',
		processData: false,
		headers: { 'Content-Type': file.type },
		crossDomain: true,
		data: file,
		xhr: function() {
			let myXhr = $.ajaxSettings.xhr();

			myXhr.upload.onprogress = function(e) {
				console.log(Math.floor(e.loaded / e.total * 100) + '%');
			};

			if(myXhr.upload){
				if({}.toString.call(cbProgress) === '[object Function]'){
					myXhr.upload.addEventListener('progress', e => {
						if(e.lengthComputable){
							let max = e.total;
							let current = e.loaded;
							let percentage = (current * 100)/max;
							cbProgress(percentage, type);
						}
					}, false);
				} else{
					myXhr.upload.addEventListener('progress', progress, false);
				}
			}

			return myXhr;
		},
	}).done(function(){
		previewUpload({ elementContainer, uri });
		countDone++;
		arrLinksUploaded = [...arrLinksUploaded, {
			uri,
			type
		}]

		if(countDone === totalFile){
			// Check is function
			({}.toString.call(cbDone) === '[object Function]') && cbDone(arrLinksUploaded);

			arrLinksUploaded = [];
			isDoneUpload = true;
			countDone = 0;
		}
	}).fail(function (error) {
		console.error(error);
	});
}

function progress(e){
	if(e.lengthComputable){
		let max = e.total;
		let current = e.loaded;
		let percentage = (current * 100)/max;
		$('.progress').css({ width: parseInt(percentage) + '%' });
	}
}

function previewUpload({ uri, elementContainer }) {
	const container = $(elementContainer);
	if(container.length){
		const img = `<img src="${uri}" alt="Img Preview" />`;
		container.append(img);
	}
}

function changeLightGallery({ lightGallery, input }){
	if ( lightGallery ){
		$(".lg-backdrop").remove();
		$(".lg-outer").remove();
		
		$(input).data('lightGallery').destroy(true);
	}

	lightGallery = $(input).lightGallery({
		thumbnail:true,
	});
}

function readURLGallery(input, idImage, type) {
	if ( input.files && input.files[0] ) {
		for (let  i = 0; i < input.files.length; i++){
			let src = URL.createObjectURL(input.files[i]);

			let deleteIcon = `deleteImage`;

				if(type == "imgAvatarAgency"){
					$(idImage).empty();
					deleteIcon = ``;
				}
				$(idImage).append(`
					<div class="img-wraps" style="width: 220px" data-src="${src}">
						<span class="close ${deleteIcon}" _type="${type}" _imgName="${input.files[i].name}" _imageID = "">&times;</span>
						<a href="${src}" class="effects" target="_blank" style="margin: 7px;">
							<img src="${src}" value="${input.files[i].name}" width="100%" height="120px  class="img-responsive" alt="Unify Admin">
							<div class="overlay">
							</div>
						</a>
					</div>
				`);
			   }
	}
}