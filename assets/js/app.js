const body = document.querySelector('body');
let BASEURL = '';
let currentPage;

$(document).ready(function() {
    // TAKE CURRENT PAGE 
    let path = window.location.pathname;
    if(path[path.length-1] !== 'l') {
        currentPage = 'index'
    }else{
        currentPage = path.substring(1).split('.')[0];
    }
    BASEURL = currentPage == 'index' ? 'assets/' : '../assets/';
    currentPage = currentPage == 'index'? currentPage : currentPage.split('/')[1]; 

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
                return `<div class="col col-lg-5 service">
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
            
            let currentlyVisibleBooks = JSON.parse(localStorage.getItem('currentlyVisibleBooks'));
            let filterArr = currentlyVisibleBooks;
            filterOrSearchIndicator = '';

            if(checkedGenreCheckboxs.length||checkedDiscauntCheckboxs){
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
                // FILTER BY PRICE
                filterOrSearchIndicator = 'f';
            }
            createBookArticles(filterArr)
            
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
        
        // CREATE BOOK ARTICLES WHEN THE PAGE IS LOADED
        function createBookArticlesOnPageLoading(booksArray){
            addToLocalStorage('allBooks' ,JSON.stringify(booksArray));
            createBookArticles(booksArray)
        }
        function createBookArticles(booksArray){
            let html='';
            deleteAllBookArticles();
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
            
            let priceSlider = createPriceRangeSlider();
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
        function createPriceRangeSlider(){
            return `<hr class="line"/><h3>Price: </h3><div class="priceRangeSlider">
                <input type="range" class="min-price" value="100" min="10" max="500" step="10">
                <input type="range" class="max-price" value="250" min="10" max="500" step="10">
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

    const closePopupBtn = document.querySelector('#closePopupBtn');
    closePopupBtn.addEventListener('click', () =>{
        closePopup(popupCart);
    });

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
        
        if(searchValue){
            let allBooks = JSON.parse(localStorage.getItem('allBooks'));

            let booksThatSatisfyTheCondition = allBooks.filter(book=>{
                if(book.title.toLowerCase().includes(searchValue.toLowerCase())){
                    return book;
                }
            })
            createBookArticles(booksThatSatisfyTheCondition)
            // localStorage.setItem('currentlyVisibleBooks' , JSON.stringify(booksThatSatisfyTheCondition));
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

    function checkIfPageIsShop(){
        if(currentPage !== 'shop'){
            window.location.pathname = currentPage === 'index'? 'pages/shop.html':'shop.html';
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
    <div class="image col col-lg-6">
        <img src="../assets/images/shop/${clickedBook.image.path}" alt="${clickedBook.image.alt}"/>
        <div class="prices">
        ${createPriceParagraphs(clickedBook)}`
    
    html +=`</div>
        </div>
        <div class="text col col-lg-6">
            <h3>${clickedBook.title}</h3>
            <p class="genres">Genre: ${getBookGenres(clickedBook.genres)}</p>
            <p class="author">Author: ${clickedBook.author}</p>
        <p class="publisher">Publisher: ${clickedBook.publisher}</p>
        <hr class="line"/>
        <p class="shortText">${clickedBook.shortDescription}</p>
        <div class="addToCart">
            <select name="bookQuantity" id="bookQuantity">
                <option value="0">Quantity</option>`;
        html += createSelectOptions(10);
        html+=`</select>
                <button class="addToCartBtn">Add to cart</button>
            </div>
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
function addBookToCart(chosenBookObj){
    $('.cartTable').css('display', 'block');
    $('.cart .empty').css('display', 'none');

    
    let cartTBody = document.querySelector('.cartTable tbody');

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
    updateCartInterface();
}
function addBookToFavourites(chosenBookObj){
    $('.favourites .empty').css('display', 'none');

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
    
    let wantedBook = titles.find(title => bookTitle == title.textContent);
    let wantedBtn =wantedBook.closest('.book').querySelector(btnClass);
    wantedBtn.removeAttribute('disabled');
}
function disableCartBtnsForBooksThatAreInCartOrFavourites(itemName , btnClass){
    let booksInCart = JSON.parse(localStorage.getItem(itemName));
    if(booksInCart){
        let booksArticles = Array.from(document.querySelectorAll('.book'));
        booksInCart.forEach(book=>{
            let wantedBook = booksArticles.find(article => article.querySelector('.title').textContent == book.title);
            wantedBook.querySelector(btnClass).setAttribute('disabled','disabled');
        })
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
    if(cartOrFavouriteBooks){
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