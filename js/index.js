$(function() {
  var $path = $('#path'),
  $imageDemo = $('#imageDemo'),
  $withWatermark = $('#withWatermark'),
  $saveImage = $('#saveImage'),
  $preview = $('#preview')
  obj = {};
  var imgSrc;


  $withWatermark.hide();
  $saveImage.hide();
  $preview.hide();


  $('#watermarkConfig')
    .on('submit', function(e) {
      e.preventDefault();
      obj = {};
      $.each($(this).serializeArray(), function(i, v) {
        var val = v.value;
        if (/^(opacity|margin|outputWidth|outputHeight)$/.test(v.name) && val !== 'auto') {
          val = parseFloat(val);
        }
        obj[v.name] = val;
      });
      $withWatermark.show(); 
      $saveImage.show();

      watermarkCreate();
    })
    .on('reset', function() {
      $path.prop('disabled', false);
      
    });


  $saveImage.click(function(){
    var div = document.getElementById('withWatermark');
    var image = div.getElementsByTagName('img')[0];
    var link = document.createElement('a');
    link.href = image.src;
    link.download = 'piniks';
    document.body.appendChild(link);
    link.click(); 
  }); 
  
  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
      imgSrc = e.target.result;
      $('#preview').attr('src', imgSrc);
      }
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }
  
  $('#file-selector').change(function() {
    readURL(this);
    $preview.show();
  });

  
  function watermarkCreate() {
    var config = $.extend(
      {},
      {
        path: 'https://i.imgur.com/KijU7NZ.png',
        gravity: 'se', // nw | n | ne | w | e | sw | s | se | c
        opacity: 0.9,
        margin: 10,

        outputWidth: 'auto',
        outputHeight: '630px',
        outputType: 'png', // jpeg | png | webm

        done: function(imgURL) {
          $withWatermark.html('<img id="imageDemo" src="' + imgURL + '">');
        },
        fail: function(imgURL) {
          $withWatermark.html('<span style="color: red;">Fail: ' + imgURL + '</span>');
        },
      },
      obj
    );
    $('<img>', {
      src: imgSrc,
    }).watermark(config);
  }
 

  
  
});
