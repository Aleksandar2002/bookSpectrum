const body = document.querySelector('body');
let BASEURL = '';
let currentPage;

$(document).ready(function() {
    // HIDE LOADER 
    $('.preloader').css('display', 'none');

    // TAKE CURRENT PAGE 
    let path = window.location.pathname;
    if(path[path.length-1] !== 'l' || path.includes('index')) {
        currentPage = 'index';
    }else{
        currentPage = path.substring(1).split('.')[0];
    }

    BASEURL = currentPage == 'index' ? 'assets/' : '../assets/';

    currentPage = currentPage == 'index'? currentPage : currentPage.split('/')[currentPage.split('/').length - 1]; 

    let filterOrSearchIndicator = '';

    if(currentPage === 'index'){
        
        waitForPromiseAndRunFunctionWithJsonData('impressionPosts.json',putDataIntoThePostFromJSON)
        let impressionBlock = document.querySelector('.impressions');
        let nextImpressionBtn = document.querySelector('#nextBtn');
        let prevImpressionBtn = document.querySelector('#prev');
        let impressionsWidth = getComputedStyle(impressionBlock).width;
        impressionsWidth = impressionsWidth.substring(0 , impressionsWidth.length-2);
        let impresionPosts;
        let numberOfTranslations = 0;
        
        nextImpressionBtn.addEventListener('click', ()=>{
            impresionPosts = takePosts();
            if(numberOfTranslations < impresionPosts.length-1){
                numberOfTranslations++;
                impresionPosts.forEach(post=>{
                    post.style.transform = `translateX(-${(impressionsWidth * numberOfTranslations)}px)`;
                })
            }else{
            }
        })
        prevImpressionBtn.addEventListener('click', ()=>{
            impresionPosts = takePosts();
            if(numberOfTranslations > 0 ){
                numberOfTranslations--;
                impresionPosts.forEach(post=>{
                    post.style.transform = `translateX(-${(impressionsWidth * numberOfTranslations)}px)`;
                })
            }
        })

        let serviceInfoRows = document.querySelectorAll('#services .row');
        waitForPromiseAndRunFunctionWithJsonData('serviceInfos.json', createServiceInfoBlocks)

        // FUNCTIONS
        function putDataIntoThePostFromJSON(posts){
            let impressionsBlock = document.querySelector(".impressions");
            let html = '';
            posts.forEach(post=>{
                impressionsBlock.innerHTML += `
                <div class="impression">
                    <img src="assets/images/homePage/impressionsCustomers/${post.image.path}" alt="${post.image.alt}"/>
                    <p>${post.postText}</p>                
                    <h4>${post.personName}</h4>
                    <p class="impression-date">${post.postDate}</p>
                    <i class="zmdi zmdi-quote"></i>
                </div>`;
            })
        }
        function takePosts(){
            return document.querySelectorAll('.impression');
        }
        function createServiceInfoBlocks(infos){
            infos.forEach((info)=>{
                if(info.id<3){
                    serviceInfoRows[0].innerHTML += returnInfoStructureString(info);
                }else{
                    serviceInfoRows[1].innerHTML += returnInfoStructureString(info);
                }
            })
            function returnInfoStructureString(info){
                return `<div class="col col-lg-5 col-md-5 col-sm-12 col-12 service">
                            <div class="text">
                                <h4>${info.infoName}</h4>
                                <p>${info.infoText}</p>
                            </div>
                            ${info.icon}
                        </div>`
            }
        }
    }
    if(currentPage === 'shop'){
        // GET DATE FROM AJAX REQUEST
        waitForPromiseAndRunFunctionWithJsonData('books.json', createBookArticlesOnPageLoading);
        waitForPromiseAndRunFunctionWithJsonData('genres.json' , createFilterConditions);

        // FILTER BTN EVENT LISTENER
        let filterBtn = document.querySelector('#filterBtn');
        filterBtn.addEventListener('click',()=>{
            let checkedGenreCheckboxs = Array.from(document.querySelectorAll('input[name^="chbGenre"]:checked'));
            let checkedDiscauntCheckboxs = document.querySelector('input[name^="chbDiscaunt"]:checked');
            let maxPrice = +document.querySelector('.priceRange input[name="maxPrice"]').value;
            let minPrice = +document.querySelector('.priceRange input[name="minPrice"]').value;
            
            let currentlyVisibleBooks = JSON.parse(localStorage.getItem('currentlyVisibleBooks'));
            let filterArr = currentlyVisibleBooks;
            filterOrSearchIndicator = '';

            if(checkedGenreCheckboxs.length||checkedDiscauntCheckboxs || maxPrice || minPrice){
                // FILTER BY GENRES 
                if(checkedGenreCheckboxs.length){
                    filterArr = currentlyVisibleBooks.filter(book => {
                        if(book.genres.some(genre=>(checkIfSomeGenreIsEqualWithTheValueOfChbs(checkedGenreCheckboxs , genre))))
                        {
                            return true;
                        }else{
                            return false;
                        }
                    })
                }
                // FILTER BY DISCAUNTS
                if(checkedDiscauntCheckboxs){
                    filterArr = filterArr.filter(book=>{
                        if(book.price.discaunt >= checkedDiscauntCheckboxs.value){
                            return true
                        }
                        return false;
                    })
                }

                if(maxPrice || minPrice){
                    if(maxPrice > minPrice && maxPrice>1 && maxPrice <= 5000 && minPrice >= 0 && minPrice < 5000){

                        $('.priceRange p.error').slideUp('slow');
    
                        filterArr = filterArr.filter(book => {
                            let currentPrice = book.price.oldPrice;
                            if(book.price.discaunt){
                                currentPrice = getNewBookPrice(book);
                            }
                            if(currentPrice < maxPrice && currentPrice > minPrice){
                                return true;
                            }
                            return false;
                        })
                    }else{
                        $('.priceRange p.error').slideDown('slow');
                    }
                }
                // FILTER BY PRICE
                filterOrSearchIndicator = 'f';
            }

            $('.books p.empty').css('display', 'none');
            if(filterArr.length == 0){
                $('.books p.empty').slideDown('slow');
            }
            
            createBookArticles(filterArr);
            $('.filter').removeClass('visible');
        })
        // Show filter btn
        $('#showHideFilter').click(function(){
            let filter = document.querySelector('.filter');
            filter.style.display = 'flex';
            setTimeout(() => {
                if(filter.classList.contains('visible')){
                    filter.classList.remove('visible');
                }else{
                    filter.classList.add('visible');
                }
            }, 1);
        })

        // SORT DDL EVENT LISTENER
        let sortDdl = document.querySelector('#ddlSort');
        sortDdl.addEventListener('change', ()=>{
            let sortOption = sortDdl.options[sortDdl.selectedIndex].value;
            let books = JSON.parse(localStorage.getItem('currentlyVisibleBooks'));
            if(localStorage.getItem('filteredBooks')){
                books = JSON.parse(localStorage.getItem('filteredBooks'));
            }
            switch(sortOption){
                case 'priceAsc':{
                    books = sortByPrice( books, 'a');
                    break;
                }
                case 'priceDesc':{
                    sortByPrice( books, 'd');
                    break;
                }
                case 'titleAsc':{
                    sortByTitle( books, 'a');
                    break;
                }
                case 'titleDesc':{
                    sortByTitle( books, 'd');
                    break;
                }
            }
            createBookArticles(books);
        })

        // CLOSE CART POPUP
        const closePopupBtn = document.querySelector('#closePopupBtn');
        closePopupBtn.addEventListener('click', () =>{
            closePopup(popupCart);
        });
        
        let buyBtn = document.querySelector('#buyBtn');
        buyBtn.addEventListener('click', () =>{
            let booksInCart = JSON.parse(localStorage.getItem('booksInCart'));
            if(booksInCart){
                $('.buyFromCartMessage').addClass('visible');
                // deleteFromLocalStorage('booksInCart');
                booksInCart.forEach(book=>{
                    enableCartBtnsForBooksThatAreInCartOrFavourites(book.title , '.addToCartBtn');
                })
                $('tbody tr').remove();
                updateCartInterface();
            }
        });
        $('.closePopupMessage').click(function(){
            $('.buyFromCartMessage').removeClass('visible');
        })
        // CREATE BOOK ARTICLES WHEN THE PAGE IS LOADED
        function createBookArticlesOnPageLoading(booksArray){
            addToLocalStorage('allBooks' ,JSON.stringify(booksArray));
            createBookArticles(booksArray)
        }
        function createBookArticles(booksArray){
            let html='';
            deleteAllBookArticles();
            if(booksArray.length){                
                booksArray.forEach((book,index)=>{
                    html += `
                    <article class="book">
                    <img src="${BASEURL}images/shop/${book.image.path}" alt="${book.image.alt}"/>
                    <h3 class="title">${book.title}</h3>
                    <div class="bottom">
                    ${createPriceParagraphs(book)}
                    <div class="cartFav">
                        <button class="addToCartBtn" onclick="addToCartOrFavourites(event)">
                            <i class="zmdi zmdi-shopping-cart-plus"></i>
                        </button>
                        <button class="addToFavouritesBtn" onclick="addToCartOrFavourites(event)">
                            <i class="zmdi zmdi-favorite-outline"></i>
                        </button>
                    </div>
                    <div class="seeMore">
                        <button class="seeMoreBtn" onclick="seeMoreAboutBook(${book.id})">
                            See more...
                        </button>
                    </div>
                    </article>` ;
                })

                $(html).insertAfter('.sectionHeader');
                checkIfIsFilterOrSearch(booksArray)
        
                disableCartBtnsForBooksThatAreInCartOrFavourites('booksInCart', '.addToCartBtn');
                disableCartBtnsForBooksThatAreInCartOrFavourites('favouriteBooks', '.addToFavouritesBtn');
            }

        }
        function checkIfIsFilterOrSearch(books){
            if(filterOrSearchIndicator === 'f'){
                addToLocalStorage('filteredBooks' ,JSON.stringify(books));
            }else{
                if(localStorage.getItem('filteredBooks')){
                    localStorage.removeItem('filteredBooks');
                }
                addToLocalStorage('currentlyVisibleBooks' ,JSON.stringify(books));
            }
            checkQuantityOfBookArticles();
        }
        function checkQuantityOfBookArticles(){
            let bookArticles = document.querySelectorAll('.book');
            if(!bookArticles.length){
                $('.books p.empty').fadeIn('slow');
            }else{
                $('.books p.empty').fadeOut('slow');
            }
        }
        // FILTER FUNCTIONS
        function createFilterConditions(genresArr){
            // ADDING GENRES TO FILTER FORM
            let genreCheckboxes = createGenresCheckboxesForFilter(genresArr);
            addToFilterFormBeforeSubmitBtn(genreCheckboxes)
            
            let discauntCheckboxes = createDiscauntCheckboxesForFilter();
            addToFilterFormBeforeSubmitBtn(discauntCheckboxes)
            
            let priceSlider = createPriceRange();
            addToFilterFormBeforeSubmitBtn(priceSlider);
        }
        function createGenresCheckboxesForFilter(genresArray){
            addToLocalStorage('allGenres',JSON.stringify(genresArray));
            let html ='<hr class="line"/><h3>Genres:</h3>';
            genresArray.forEach(genre=>{
                html +=`
                <div class="form-field">
                    <input type="checkbox" name="chbGenre${genre.id}" id="chbGenre${genre.id}" value="${genre.id}"/>
                    <label for="chbGenre${genre.id}">${makeFirstLetterUpercase(genre.name)}</label>
                </div>`
            })
            return html;
        }
        function createDiscauntCheckboxesForFilter(){
            let html = '<hr class="line"/><h3>Discaunts</h3>'
            for(let i = 10;i<51; i+=10){
                html += `
                <div class="form-field">
                    <input type="checkbox" name="chbDiscaunt${i}" id="chbDiscaunt${i}" value="${i}"/>
                    <label for="chbDiscaunt${i}">${i}% or More</label>
                </div>`
            }
            return html;
        }
        function createPriceRange(){
            return `<hr class="line"/><h3>Price: </h3><div class="priceRange">
                <input type="number" name="minPrice" min="0" max="5000" step="100" placeholder="Min price"/>
                <input type="number" name="maxPrice" min="1" max="5000" step="100" placeholder="Max price"/>
                <p class="error">Invalid price format , max is 5000RSD</p>
            </div><hr class="line"/>`
        }
        function addToFilterFormBeforeSubmitBtn(element){
            $(element).insertBefore('.filter form #filterBtn');
        }
        function checkIfSomeGenreIsEqualWithTheValueOfChbs(array , element){
            if(array.some(el=>{
                return +el.value === +element?true:false;
            }))
            {
                return true;
            }
            return false;
        }
        // SORT FUNCTIONS 
        function sortByPrice( array, type){
            return array.sort((a,b)=>{
                    let aPrice = getNewBookPrice(a);
                    let bPrice = getNewBookPrice(b);
                    if(type == 'a'){
                        return sortAsc(aPrice , bPrice)
                    }else{
                        return sortDesc(aPrice , bPrice);
                    }
            });
        }
        function sortByTitle( array, type){
            return array.sort((a,b)=>{
                    let aTitle = a.title;
                    let bTitle = b.title;
                    if(type == 'a'){
                        return sortAsc(aTitle , bTitle)
                    }else{
                        return sortDesc(aTitle , bTitle);
                    }
            });
        }
        function sortAsc(a,b){
            if(a>b){
                return 1;
            }else if(a<b){
                return -1
            }
            return 0;
        }
        function sortDesc(a,b){
            if(a>b){
                return -1;
            }else if(a<b){
                return 1
            }
            return 0;
        }
    }
    if(currentPage === 'contact'){
        $('input').val = '';
        let ddlDay = document.querySelector('#day');

        ddlDay.innerHTML += createDateSelect(1,31);
        document.querySelector('#month').innerHTML += createSelectOptions(13);
        document.querySelector('#year').innerHTML += createDateSelect(1960 , 2005);
        
        let ddlMonth = document.querySelector('#month');
        ddlMonth.addEventListener('change',()=>{
            let month = ddlMonth.options[ddlMonth.selectedIndex].value;
            let days ='';

            switch(month){
                case '1' :case '3': case '5':case '7' :case'8':case'10' : case '12':{
                    days = createDateSelect(1,31); 
                    break;
                }
                case "4" : case'6' :case '9' :case'11' :{
                    days = createDateSelect(1,30); 
                    break;
                }
                case "2":{
                    days = createDateSelect(1,29);
                }
            }
            ddlDay.innerHTML = '<option value="0">Day</option>'+days;
        })

        let textInputs = document.querySelectorAll('.contactForm input[type="text"],.contactForm input[type="password"]');
        textInputs.forEach(input=>{
            let label = input.parentElement.querySelector('label');
            input.addEventListener('focus', ()=>{
                label.classList.add('focused');
            })
            input.addEventListener('blur', ()=>{
                if(!input.value){
                    label.classList.remove('focused');
                }
            })
        })

        textInputs.forEach(input => {
            input.addEventListener('input', ()=>{
                let inputValue = input.value;
                let regExp;
                let inputName = input.getAttribute('name')

                switch(inputName){
                    case 'fName':{
                        regExp = /^[A-Z][a-z]{2,10}$/;
                        checkInputValue(input , regExp ,inputName);
                        break;
                    }
                    case 'lName':{
                        regExp = /^[A-Z][a-z]{2,10}$/;
                        checkInputValue(input , regExp, inputName);
                        break;
                    }
                    case 'email':{
                        regExp = /^[a-z0-9.-]{4,20}@(gmail.com|yahoo.com)$/;
                        checkInputValue(input , regExp , inputName);
                        break;
                    }
                    case 'password': case 'confirmPass':{
                        regExp = /^[A-z0-9@#$-.]{8,20}$/;
                        if(inputName=='password'){
                            if((!regExp.test(inputValue) || !/[A-Z]/.test(inputValue) ||  !/[a-z]/.test(inputValue)&& !/[0-9]{4,20}/.test(inputValue))){
                                slideDownErrorParagraph('password');
                            }else{
                                slideUpErrorParagraph('password');
                            }
                        }
                        if($('#confirmPass').val() != $('#password').val()){
                            slideDownErrorParagraph('confirmPass');
                        }else{
                            slideUpErrorParagraph('confirmPass');
                        }
                        break;
                    }
                }
            })
        })
        
        $('#submitBtn').click(function(e){
            e.preventDefault();
            // CHECK IF SOME TEXT FIELD IS EMPTY
            if(checkIfTextFieldsAreEmpty()){
                slideDownErrorParagraph('submitError');
            }else{
                slideUpErrorParagraph('submitError');
            }
            // CHECK IF THE USER SELECT ALL PART OF DATE OF BIRTH
            let dateOfBirthSelects = document.querySelectorAll('#day , #month, #year');
            dateOfBirthSelects.forEach(select=>{
                if(select.options[select.selectedIndex].value == 0){
                    slideDownErrorParagraph('dateOfBirth');
                }else{
                    slideUpErrorParagraph('dateOfBirth');
                }
            })
            // ASK IF GENDER IS CHECKED
            let gender = document.querySelector('input[name="gender"]:checked');
            if(!gender){
                slideDownErrorParagraph('gender');
            }else{
                slideUpErrorParagraph('gender');
            }
            // ASK IF TERMS ARE ACCEPTED
            let terms = document.querySelector('#terms:checked');
            if(!terms){
                slideDownErrorParagraph('terms');
            }else{
                slideUpErrorParagraph('terms')
            }
            
            let textarea = document.querySelector('textarea[name="message"]');
            let textReg= /^[A-Z][A-z0-9.-/\s]{8,40}$/;
            if(!textReg.test(textarea.value)){
                slideDownErrorParagraph('message')
            } else{  
                slideUpErrorParagraph('message')
            }

            // IF THERE IS ANY ERROR MESSAGE DONT SEND A FORM
            let errorParagraphs = Array.from($('p.error'));
            if(errorParagraphs.some(p => p.classList.contains('visible'))){
                return;
            }else{
                let popup = document.querySelector('#submitedForm');
                openPopup(popup);
            }
        })

        $('#submitedForm .closeBtn').click(function(){
            let popup = document.querySelector('#submitedForm');
            closePopup(popup);
            document.querySelector('.contactForm form').reset();
        })

        function checkIfTextFieldsAreEmpty(){
            let inputs = Array.from($('.contactForm input[type="text"], .contactForm input[type="password"],textarea'));

            if(inputs.some(input => input.value == '')){
                return true;
            }
            return false;
        }
        // Hide or show password value on btn hide click
        $('.hideShowBtn').click(function(e){
            e.preventDefault();
            let input =  this.previousElementSibling;
            if(input.getAttribute('type')== 'password'){
                showOrHidePassword(input , this , 'text', 'zmdi zmdi-eye-off');
                return;
            }
            showOrHidePassword(input , this , 'password', 'zmdi zmdi-eye');
        })
        function showOrHidePassword(input , btn , type , iconClass){
            input.setAttribute('type', type);
            btn.innerHTML = (`<i class="${iconClass}"></i>`);
        }
        function slideDownErrorParagraph(name){
            $('p.'+name).addClass("visible");
            $('p.'+name).slideDown('slow');

        }
        function slideUpErrorParagraph(name){
            $('p.'+name).removeClass("visible");
            $('p.'+name).slideUp('slow');
        }
        function testRegularExpression(value, reg){
            return reg.test(value) ? true : false;
        }
        function checkInputValue(input , reg , name){
            if(!testRegularExpression(input.value, reg)){
                slideDownErrorParagraph(name);
            }else{
                slideUpErrorParagraph(name);
            }
        }
        function createDateSelect(start , end){
            let html = ``;
            for(let i=start ; i<=end ; i++){
                html+= `<option value="${i}">${i}</option>`;
            }
            return html;
        }
    }

    // CREATE NAV LINKS FROM JSON DATA
    waitForPromiseAndRunFunctionWithJsonData('navigation.json',createNavLinks);
    waitForPromiseAndRunFunctionWithJsonData('socials.json',createSocialNetworkLinks);

    // POPUP CONTROL FOR CART AND FAVOURITES BTNS IN HEADER
    const secondaryHeaderBtns = document.querySelectorAll('#cartBtn , #favBtn');
    const popupCart = document.querySelector('.popupCartFav');

    secondaryHeaderBtns.forEach(btn=>{
        btn.addEventListener('click',()=>{
            let favouritesDiv = document.querySelector('.favourites');
            let cartDiv = document.querySelector('.cart');

            if(!checkIfPageIsShop()){
                return;
            }
            if(btn.getAttribute('id') === 'cartBtn'){
                cartDiv.classList.add('open');
                favouritesDiv.classList.remove('open')
            }else{
                cartDiv.classList.remove('open');
                favouritesDiv.classList.add('open')
            }

            openPopup(popupCart);
        });
    })

    // LOAD BOOKS FROM LOCAL STORAGE THAT ARE IN CART OR FAVOURITES WHEN THE PAGE LOADS 
    loadBooksInCartOrFavouritesFromLocalStorage('booksInCart');
    loadBooksInCartOrFavouritesFromLocalStorage('favouriteBooks');

    // SEARCH BTN EVENT LISTENER ON CLICK 
    let searchBtn = document.querySelector('#searchBtn');
    searchBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        filterOrSearchIndicator = 's';
        if(!checkIfPageIsShop()){
            return;
        }
        let searchValue = document.querySelector('#searchTxb').value;
        let allBooks = JSON.parse(localStorage.getItem('allBooks'));
        $('.books p.empty').slideUp('slow');
        
        if(searchValue){

            let booksThatSatisfyTheCondition = allBooks.filter(book=>{
                if(book.title.toLowerCase().includes(searchValue.toLowerCase())){
                    return book;
                }
            })
            if(booksThatSatisfyTheCondition.length == 0){
                $('.books p.empty').slideDown('slow');
            }
            createBookArticles(booksThatSatisfyTheCondition)
            
            localStorage.setItem('currentlyVisibleBooks' , JSON.stringify(booksThatSatisfyTheCondition));
        }else{
            createBookArticles(allBooks);
        }
    })


    // SCROLL TO TOP BUTTON
    $(window).scroll(function(){
        if(window.scrollY > 800){
            $('#toTop').css('display', 'block');
        }else{
            $('#toTop').css('display', 'none');
        }
    })
    $('#toTop button').click(()=>{
        $(window).scrollTop(0);
    })

    // hamburger btn event
    let hamburgerBtn = document.querySelector('.hamburgerBtn button');
    hamburgerBtn.addEventListener('click', ()=>{
        hamburgerBtnAnimation(hamburgerBtn);
        let navigation = document.querySelector('header .navigation');

        if(navigation.classList.contains('visible')){
            navigation.classList.remove('visible');
        }else{
            navigation.classList.add('visible');
        }
    })
    function hamburgerBtnAnimation(btn){
        let middleDiv = btn.children[1];
        let firstDiv = btn.children[0];
        let lastDiv = btn.children[2];

        if(!middleDiv.classList.contains('fadeOut')){
            middleDiv.classList.add('fadeOut');
            lastDiv.classList.add('rotate1');
            firstDiv.classList.add('rotate2');
            
        }else{
            middleDiv.classList.remove('fadeOut');
            lastDiv.classList.remove('rotate1');
            firstDiv.classList.remove('rotate2');
        }
    }
    $('.navigation .closeNav').click(function(){
        let navigation = document.querySelector('header .navigation');
        navigation.classList.remove('visible');
        hamburgerBtnAnimation(document.querySelector('.hamburgerBtn button'));
    })
    function checkIfPageIsShop(){
        if(currentPage !== 'shop'){
            if(currentPage !== 'index'){
                window.location = 'shop.html';
            }else{
                window.location = 'pages/shop.html'
            }
            return false;
        }
        return true;
    }
    function deleteAllBookArticles(){
        let booksArticles = document.querySelectorAll('.book');
        if(booksArticles.length){
            booksArticles.forEach(article=>{
                article.remove();
            })
        }
    }
})

// FUNCTIONS FOR SEE MORE BTN
function seeMoreAboutBook(bookId){

    let clickedBook = getCurrentlyOpenedBook(bookId);
    openPopup(document.querySelector('.seeMore-outer'));
    let seeMoreContent = document.querySelector('.seeMore-content');

    let html = `
    <div class="image col col-lg-6 col-md-6 col-sm-6 col-12">
        <img src="../assets/images/shop/${clickedBook.image.path}" alt="${clickedBook.image.alt}"/>
        <div class="prices">
        ${createPriceParagraphs(clickedBook)}`
    
    html +=`</div>
        </div>
        <div class="text col col-lg-6 col-md-6 col-sm-6 col-12">
            <h3 class="title">${clickedBook.title}</h3>
            <p class="genres">Genre: ${getBookGenres(clickedBook.genres)}</p>
            <p class="author">Author: ${clickedBook.author}</p>
        <p class="publisher">Publisher: ${clickedBook.publisher}</p>
        <hr class="line"/>
        <p class="shortText">${clickedBook.shortDescription}</p>
            <button class="closeBtn" onclick="closeBookPopup(event)"><i class="zmdi zmdi-close"></i></button>`

    seeMoreContent.innerHTML = html;
}
function getCurrentlyOpenedBook(bookId){
    let books = JSON.parse(localStorage.getItem('allBooks'));
    return books.find((book)=>bookId == book.id);
}
function getNewBookPrice(book){
    return parseInt(book.price.oldPrice * (book.price.discaunt / 100 + 1));
}
function getBookGenres(bookGenres){
    let allGenres = JSON.parse(localStorage.getItem('allGenres'));
    let genresString ='';
    bookGenres.forEach(bookGenre=>{
        genresString += allGenres.find(genreFromLocalStorage=>genreFromLocalStorage.id == bookGenre).name+'/';
    })
    return(genresString.substring(0, genresString.length-1));
}
function makeFirstLetterUpercase(someString){
    return someString.charAt(0).toUpperCase() + someString.substring(1);
}

// FUNCTION FOR CART OR FAVOURITES
function addToCartOrFavourites(e){
    let clickedBtn = e.target.closest('button');
    clickedBtn.setAttribute('disabled', 'disabled');
    let chosenBookObj = getChosenBook(clickedBtn);

    if(clickedBtn.classList.contains('addToCartBtn')){  
        addBookToCart(chosenBookObj);
    }else{
        addBookToFavourites(chosenBookObj);
    }
}
function addBookToCart(chosenBookObj ){
    $('.cartTable').css('display', 'block');
    $('.cart .empty').css('display', 'none');

    
    let cartTBody = document.querySelector('.cartTable tbody');
    let cartElements = document.querySelectorAll('.cartTable tr');

    if(cartElements !== null && cartElements.length<5 && cartElements.length> 0){
        let html = `
        <tr>
        <td><img src="${BASEURL}images/shop/${chosenBookObj.image.path}" alt="${chosenBookObj.image.alt}"/></td>
        <td class="title">${chosenBookObj.title}</td><td>
        <span class="price">${ takeCurrentBookPrice(chosenBookObj)}</span>RSD</td><td>
            <select name="quantity" id="quantity" onchange="updateCartInterface()">
            ${createSelectOptions(20)}</select>
        </td>
        <td><button class="deleteCartProduct" onclick="deleteFromCartOrFavourites(event , 'tr' , 'c')">Delete</button></td>
        </tr>`;
    
        cartTBody.innerHTML += html;
        // document.querySelector('tr select#quantity').value = quantity;
        updateCartInterface();
    }
}
function addBookToFavourites(chosenBookObj){
    $('.favourites .empty').css('display', 'none');

    let favElements = document.querySelectorAll('.fav-product');
    if(favElements.length<4){
        let html = `
        <div class="fav-product">
            <div class="fav-img">
            <img src="${BASEURL}images/shop/${chosenBookObj.image.path}" alt="${chosenBookObj.image.alt}"/>
            </div>
            <div class="fav-footer">
                <h4 class="title">${chosenBookObj.title}</h4>
                <p>${takeCurrentBookPrice(chosenBookObj)}RSD</p>
                <button class="removeFromFavBtn" onclick="deleteFromCartOrFavourites(event , '.fav-product' , 'f')">Remove</button>
            </div>
        </div>`;
    
        document.querySelector('.fav-products').innerHTML += html;
        
        addCartorFavouriteBooksToLocalStorage('favouriteBooks', '.fav-product h4');
        changeProductsNumberInSpan(document.querySelectorAll('.fav-product').length ,'#favBtn')
    }

}
function updateCartInterface(){    
    let totalPrice = getTotalPrice();
    let totalQuantity = getTotalQuantity();

    if(!totalQuantity){
        $('.cartTable').hide();
        $('.empty').show();
    }

    changeProductsNumberInSpan(totalQuantity , '#cartBtn');

    $('span#totalPrice').html(totalPrice);
    $('span#numberOfProducts').html(totalQuantity);
    addCartorFavouriteBooksToLocalStorage('booksInCart' , '.cartTable tbody td');
}
function changeProductsNumberInSpan(quantity , parent){
    let span = document.querySelector(parent+' span.productNumber');
    span.textContent = quantity;
}
function getTotalPrice(){
    let totalPrice = 0;
    let bookTrs =  document.querySelectorAll(".cartTable tbody tr");
    bookTrs.forEach(tr=>{
         totalPrice += (+tr.querySelector('.price').innerHTML * tr.querySelector('select').value);
    })
    return totalPrice;
}
function getTotalQuantity(){
    let totalQuantity = 0;
    let quantitySelects =  document.querySelectorAll(".cartTable tbody td select");

    quantitySelects.forEach(select=>{
        totalQuantity += +select.value;
    })
    return totalQuantity;
}
function getChosenBook(clickedBtn){
    let chosenBookDiv = clickedBtn.closest('.book');
    let bookTitle = chosenBookDiv.querySelector('.title').textContent;

    let allBooks = JSON.parse(localStorage.getItem('allBooks'));
    return allBooks.find(book=>book.title == bookTitle);
}
function takeCurrentBookPrice(chosenBookObj){
    return chosenBookObj.price.discaunt ? getNewBookPrice(chosenBookObj): chosenBookObj.price.oldPrice;
}
function deleteFromCartOrFavourites(e , parent , btnType){
    let parentEl = e.target.closest(parent);
    let bookTitle = parentEl.querySelector('.title').textContent;
    
    parentEl.remove();

    if(btnType == 'c'){

        addCartorFavouriteBooksToLocalStorage('booksInCart' , '.cartTable tbody td');
        updateCartInterface();
        enableCartBtnsForBooksThatAreInCartOrFavourites(bookTitle , '.addToCartBtn');

    }else{
        enableCartBtnsForBooksThatAreInCartOrFavourites(bookTitle , '.addToFavouritesBtn');

        if(!document.querySelectorAll('.fav-product').length){
            $('.favourites .empty').css('display', 'block');
        }
        changeProductsNumberInSpan(document.querySelectorAll('.fav-product').length ,'#favBtn')
        addCartorFavouriteBooksToLocalStorage('favouriteBooks', '.fav-product h4');
    }
}
function enableCartBtnsForBooksThatAreInCartOrFavourites(bookTitle , btnClass){
    let titles = Array.from(document.querySelectorAll('.book h3.title'));

    if(titles!== null && titles.length> 0){

        let wantedBook = titles.find(title => bookTitle == title.textContent);
        let wantedBtn =wantedBook.closest('.book').querySelector(btnClass);
        wantedBtn.removeAttribute('disabled');
    }
}
function disableCartBtnsForBooksThatAreInCartOrFavourites(itemName , btnClass){
    let booksInCart = JSON.parse(localStorage.getItem(itemName));

    if(booksInCart!== null && booksInCart.length>0){

        let booksArticles = Array.from(document.querySelectorAll('.book'));
        
        if(booksArticles!== null && booksArticles.length>0){

            booksInCart.forEach(book=>{
                let wantedBook = booksArticles.find(article => article.querySelector('.title').textContent == book.title);
                if(wantedBook){
                    wantedBook.querySelector(btnClass).setAttribute('disabled','disabled');
                }
            })

        }
    }
}

// POPUP FUNCTIONS
function openPopup(popup){
    popup.classList.add('open');
    body.setAttribute('scroll' , 'no');
    body.setAttribute('style' , 'overflow:hidden');
}
function closePopup(popup){
    popup.classList.remove('open');
    body.removeAttribute('scroll');
    body.removeAttribute('style');
}
function closeBookPopup(e){
    closePopup(e.target.closest('.seeMore-outer'));
}

// LOCAL STORAGE AND COOKIES FUNCTIONS
function addToLocalStorage(itemName, itemValue){
    localStorage.setItem(itemName, itemValue);
}
function deleteFromLocalStorage(itemName){
    localStorage.removeItem(itemName);
}
function addCartorFavouriteBooksToLocalStorage(itemName , parentElement){
    let titlesOfBooksInCartOrFavourites = document.querySelectorAll(parentElement+'.title');

    let booksObjArray = [];
    let allBooks = JSON.parse(localStorage.getItem('allBooks'));

    titlesOfBooksInCartOrFavourites.forEach(title=>{
        booksObjArray.push(allBooks.find(book=> book.title == title.textContent));
    })
    
    if(booksObjArray.length){
        addToLocalStorage(itemName,JSON.stringify(booksObjArray));
    }else{
        localStorage.removeItem(itemName);
    }
}
function loadBooksInCartOrFavouritesFromLocalStorage(itemName){
    let cartOrFavouriteBooks = JSON.parse(localStorage.getItem(itemName));
    if(cartOrFavouriteBooks !== null && cartOrFavouriteBooks.length){

        if(itemName.toLowerCase().includes('cart')){
            cartOrFavouriteBooks.forEach(book=>{
                addBookToCart(book);
            })
        }else{
            cartOrFavouriteBooks.forEach(book=>{
                addBookToFavourites(book);
            })
        }
    }
}

// DYNAMIC CREATION
function createNavLinks(navArray){
    let headerUl = document.querySelector('header ul.menu');
    let footerUl = document.querySelector('footer ul.menu');

    if(currentPage === 'index'){
        navArray.forEach(navObj =>{
            if(navObj.text !== 'Home'){
                headerUl.innerHTML += `<li><a href="pages/${navObj.href}">${navObj.text}</a></li>`;
                footerUl.innerHTML += `<li><a href="pages/${navObj.href}">${navObj.text}</a></li>`;
            }else{
                headerUl.innerHTML += `<li><a href="${navObj.href}">${navObj.text}</a></li>`;
                footerUl.innerHTML += `<li><a href="${navObj.href}">${navObj.text}</a></li>`;
            }
        })
    } else {
        navArray.forEach(navObj => {
            if(navObj.text !== 'Home'){
                headerUl.innerHTML += `<li><a href="${navObj.href}">${navObj.text}</a></li>`;
                footerUl.innerHTML += `<li><a href="${navObj.href}">${navObj.text}</a></li>`;
            }else{
                headerUl.innerHTML += `<li><a href="../${navObj.href}">${navObj.text}</a></li>`;
                footerUl.innerHTML += `<li><a href="../${navObj.href}">${navObj.text}</a></li>`;
            }
        })
    }

    let currentPageLinks = document.querySelectorAll(`ul a[href$="${currentPage}.html"]`);
    currentPageLinks.forEach(el=>{
        el.classList.add('activeLink');
    })
}
function createSocialNetworkLinks(socialsArray){
    let socialUl = document.querySelector('ul.social-networks');
    socialsArray.forEach(social=>{
        socialUl.innerHTML += `<li><a href="${social.href}">${social.icon}</a></li>`;
    })
}
function createSelectOptions(number){
    let html ='';
    for(let i = 1 ;i<number;i++){
        html+=`<option value="${i}">${i}</option>`;
    }
    return html;
}
function createPriceParagraphs(book){
    let newPrice = book.price.oldPrice;

    if(book.price.discaunt){
        newPrice = getNewBookPrice(book);

        return `<p class="oldPrice">${book.price.oldPrice}RSD</p>
        <p class="newPrice">${newPrice}RSD</p>
        <span class="discaunt">${book.price.discaunt}%</span>`;

    }else{
        return `<p class="newPrice">${book.price.oldPrice}RSD</p></div>`;
    }
}

// FUNCTIONS FOR AJAX REQUEST
function sendAjaxRequest(url , method){
    return new Promise((resolve, reject)=>{
        $.ajax({
            method: method,
            url: BASEURL+'Data/' +url,
            dataType: "json",
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error);
            }
        });
    })
}
function waitForPromiseAndRunFunctionWithJsonData(json , func){
    let promise = sendAjaxRequest(json , 'GET');
    promise.then((response)=>{
        func(response);
    }).catch(err=>alert(err))
}