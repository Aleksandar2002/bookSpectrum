$(document).ready(function() {
    let data;
    $.ajax({
        type: "GET",
        url: "data.json",
        contentType: "application/json",
        dataType : 'json',
        error: function(error) {
            alert("Json file cannot be found!")
        },
        success: function (response) {
            console.log(response);    
        }
    });
    const secondaryHeaderBtns = document.querySelectorAll('#cartBtn , #favBtn');
    const popupCart = document.querySelector('.popupCartFav');
    const body = document.querySelector('body');

    secondaryHeaderBtns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            openPopupCartFav();
            if(btn.getAttribute('id') === 'cartBtn'){
                
            }
        });
    })
    const closePopupBtn = document.querySelector('#closePopupBtn');
    closePopupBtn.addEventListener('click', () =>{
        closePopupCartFav();
    });
    // FUNCTIONS
    function openPopupCartFav(){
        popupCart.classList.add('open');
        body.setAttribute('scroll' , 'no');
        body.setAttribute('style' , 'overflow:hidden');
    }
    function closePopupCartFav(){
        popupCart.classList.remove('open');
        let body = document.querySelector('body');
        body.removeAttribute('scroll');
        body.removeAttribute('style');
    }
})