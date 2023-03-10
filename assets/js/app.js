const body=document.querySelector("body");let BASEURL="",currentPage;function seeMoreAboutBook(e){let t=getCurrentlyOpenedBook(e);openPopup(document.querySelector(".seeMore-outer"));let r=document.querySelector(".seeMore-content"),o=`
    <div class="image col col-lg-6 col-md-6 col-sm-6 col-12">
        <img src="../assets/images/shop/${t.image.path}" alt="${t.image.alt}"/>
        <div class="prices">
        ${createPriceParagraphs(t)}`;o+=`</div>
        </div>
        <div class="text col col-lg-6 col-md-6 col-sm-6 col-12">
            <h3 class="title">${t.title}</h3>
            <p class="genres">Genre: ${getBookGenres(t.genres)}</p>
            <p class="author">Author: ${t.author}</p>
        <p class="publisher">Publisher: ${t.publisher}</p>
        <hr class="line"/>
        <p class="shortText">${t.shortDescription}</p>
            <button class="closeBtn" onclick="closeBookPopup(event)"><i class="zmdi zmdi-close"></i></button>`,r.innerHTML=o}function getCurrentlyOpenedBook(e){return JSON.parse(localStorage.getItem("allBooks")).find(t=>e==t.id)}function getNewBookPrice(e){return parseInt(e.price.oldPrice*(e.price.discaunt/100+1))}function getBookGenres(e){let t=JSON.parse(localStorage.getItem("allGenres")),r="";return e.forEach(e=>{r+=t.find(t=>t.id==e).name+"/"}),r.substring(0,r.length-1)}function makeFirstLetterUpercase(e){return e.charAt(0).toUpperCase()+e.substring(1)}function addToCartOrFavourites(e){let t=e.target.closest("button");t.classList.add("clicked");let r=getChosenBook(t),o=document.querySelector(".addToCartMessagePopup");t.classList.contains("addToCartBtn")?checkIfBookIsInCart(r)?o.querySelector("h2").textContent="Book is already in the cart":(o.querySelector("h2").textContent="Book is added to the cart",addBookToCart(r)):checkIfBookIsInFavourites(r)?o.querySelector("h2").textContent="Book is already in the favourites":(o.querySelector("h2").textContent="Book is added to the favourites",addBookToFavourites(r)),openPopup(o)}function addBookToCart(e){$(".cartTable").css("display","block"),$(".cart .empty").css("display","none"),$(".cartFooter p").show();let t=document.querySelector(".cartTable tbody"),r=document.querySelectorAll(".cartTable tr");if(null!==r&&r.length<5&&r.length>0){let o=`
        <tr">
        <td><img src="${BASEURL}images/shop/${e.image.path}" alt="${e.image.alt}"/></td>
        <td class="title">${e.title}</td><td>
        <span class="price">${takeCurrentBookPrice(e)}</span>RSD</td><td>
            <select name="quantity${e.id}" data-id="${e.id}" onchange="updateCartInterface()">
            ${createSelectOptions(20)}</select>
        </td>
        <td><button class="deleteCartProduct" onclick="deleteFromCartOrFavourites(event , 'tr' , 'c')">Delete</button></td>
        </tr>`;t.innerHTML+=o,e.quantity&&Array.from(document.querySelectorAll(`select[data-id="${e.id}"] option`)).find(t=>t.value==e.quantity).setAttribute("selected","selected"),updateCartInterface()}}function addBookToFavourites(e){$(".favourites .empty").css("display","none");if(document.querySelectorAll(".fav-product").length<4){let t=`
        <div class="fav-product">
            <div class="fav-img">
            <img src="${BASEURL}images/shop/${e.image.path}" alt="${e.image.alt}"/>
            </div>
            <div class="fav-footer">
                <h4 class="title">${e.title}</h4>
                <p>${takeCurrentBookPrice(e)}RSD</p>
                <button class="removeFromFavBtn" onclick="deleteFromCartOrFavourites(event , '.fav-product' , 'f')">Remove</button>
            </div>
        </div>`;document.querySelector(".fav-products").innerHTML+=t,addCartorFavouriteBooksToLocalStorage("favouriteBooks",".fav-product h4","f"),changeProductsNumberInSpan(document.querySelectorAll(".fav-product").length,"#favBtn")}}function updateCartInterface(){let e=getTotalPrice(),t=getTotalQuantity();t||($(".cartTable").hide(),$(".cart .empty").show(),$(".cartFooter p").hide()),changeProductsNumberInSpan(t,"#cartBtn"),$("span#totalPrice").html(e),$("span#numberOfProducts").html(t),addCartorFavouriteBooksToLocalStorage("booksInCart",".cartTable tbody td","c")}function changeProductsNumberInSpan(e,t){document.querySelector(t+" span.productNumber").textContent=e}function getTotalPrice(){let e=0;return document.querySelectorAll(".cartTable tbody tr").forEach(t=>{e+=+t.querySelector(".price").innerHTML*t.querySelector("select").value}),e}function getTotalQuantity(){let e=0;return document.querySelectorAll(".cartTable tbody td select").forEach(t=>{e+=+t.value}),e}function getChosenBook(e){let t=e.closest(".book").querySelector(".title").textContent;return JSON.parse(localStorage.getItem("allBooks")).find(e=>e.title==t)}function takeCurrentBookPrice(e){return e.price.discaunt?getNewBookPrice(e):e.price.oldPrice}function deleteFromCartOrFavourites(e,t,r){let o=e.target.closest(t),a=o.querySelector(".title").textContent;o.remove(),"c"==r?(addCartorFavouriteBooksToLocalStorage("booksInCart",".cartTable tbody td","c"),updateCartInterface(),enableCartBtnsForBooksThatAreInCartOrFavourites(a,".addToCartBtn")):(enableCartBtnsForBooksThatAreInCartOrFavourites(a,".addToFavouritesBtn"),document.querySelectorAll(".fav-product").length||$(".favourites .empty").css("display","block"),changeProductsNumberInSpan(document.querySelectorAll(".fav-product").length,"#favBtn"),addCartorFavouriteBooksToLocalStorage("favouriteBooks",".fav-product h4","f"))}function enableCartBtnsForBooksThatAreInCartOrFavourites(e,t){let r=Array.from(document.querySelectorAll(".book h3.title"));null!==r&&r.length>0&&r.find(t=>e==t.textContent).closest(".book").querySelector(t).classList.remove("clicked")}function disableCartBtnsForBooksThatAreInCartOrFavourites(e,t){let r=JSON.parse(localStorage.getItem(e));if(null!==r&&r.length>0){let o=Array.from(document.querySelectorAll(".book"));null!==o&&o.length>0&&r.forEach(e=>{let r=o.find(t=>t.querySelector(".title").textContent==e.title);r&&r.querySelector(t).classList.add("clicked")})}}function checkIfBookIsInCart(e){let t=JSON.parse(localStorage.getItem("booksInCart"));return!!t&&t.some(t=>{if(t.id==e.id)return!0})}function checkIfBookIsInFavourites(e){let t=JSON.parse(localStorage.getItem("favouriteBooks"));return!!t&&t.some(t=>{if(t.id==e.id)return!0})}function openPopup(e){e.classList.add("open"),body.setAttribute("scroll","no"),body.setAttribute("style","overflow:hidden")}function closePopup(e){e.classList.remove("open"),body.removeAttribute("scroll"),body.removeAttribute("style")}function closeBookPopup(e){closePopup(e.target.closest(".seeMore-outer"))}function addToLocalStorage(e,t){localStorage.setItem(e,t)}function deleteFromLocalStorage(e){localStorage.removeItem(e)}function addCartorFavouriteBooksToLocalStorage(e,t,r){let o=document.querySelectorAll(t+".title"),a=[],s=JSON.parse(localStorage.getItem("allBooks"));"f"==r?o.forEach(e=>{a.push(s.find(t=>t.title==e.textContent))}):o.forEach(e=>{let t=s.find(t=>t.title==e.textContent);t.quantity=document.querySelector(`select[data-id="${t.id}"]`).value,a.push(t)}),a.length?addToLocalStorage(e,JSON.stringify(a)):localStorage.removeItem(e)}function loadBooksInCartOrFavouritesFromLocalStorage(e){let t=JSON.parse(localStorage.getItem(e));null!==t&&t.length&&(e.toLowerCase().includes("cart")?t.forEach(e=>{addBookToCart(e)}):t.forEach(e=>{addBookToFavourites(e)}))}function createNavLinks(e){let t=document.querySelector("header ul.menu"),r=document.querySelector("footer ul.menu");"index"===currentPage?e.forEach(e=>{"Home"!==e.text?(t.innerHTML+=`<li><a href="pages/${e.href}">${e.text}</a></li>`,r.innerHTML+=`<li><a href="pages/${e.href}">${e.text}</a></li>`):(t.innerHTML+=`<li><a href="${e.href}">${e.text}</a></li>`,r.innerHTML+=`<li><a href="${e.href}">${e.text}</a></li>`)}):e.forEach(e=>{"Home"!==e.text?(t.innerHTML+=`<li><a href="${e.href}">${e.text}</a></li>`,r.innerHTML+=`<li><a href="${e.href}">${e.text}</a></li>`):(t.innerHTML+=`<li><a href="../${e.href}">${e.text}</a></li>`,r.innerHTML+=`<li><a href="../${e.href}">${e.text}</a></li>`)});document.querySelectorAll(`ul a[href$="${currentPage}.html"]`).forEach(e=>{e.classList.add("activeLink")})}function createSocialNetworkLinks(e){let t=document.querySelector("ul.social-networks");e.forEach(e=>{t.innerHTML+=`<li><a href="${e.href}">${e.icon}</a></li>`})}function createSelectOptions(e){let t="";for(let r=1;r<e;r++)t+=`<option value="${r}">${r}</option>`;return t}function createPriceParagraphs(e){let t=e.price.oldPrice;return e.price.discaunt?`<p class="oldPrice">${e.price.oldPrice}RSD</p>
        <p class="newPrice">${t=getNewBookPrice(e)}RSD</p>
        <span class="discaunt">${e.price.discaunt}%</span>`:`<p class="newPrice">${e.price.oldPrice}RSD</p></div>`}function sendAjaxRequest(e,t){return new Promise((r,o)=>{$.ajax({method:t,url:BASEURL+"Data/"+e,dataType:"json",success:function(e){r(e)},error:function(e,t){var r="";o(r=0===e.status?"Not connect.\n Verify Network.":404==e.status?"Requested page not found. [404]":500==e.status?"Internal Server Error [500].":"parsererror"===t?"Requested JSON parse failed.":"timeout"===t?"Time out error.":"abort"===t?"Ajax request aborted.":"Uncaught Error.\n"+e.responseText)}})})}function waitForPromiseAndRunFunctionWithJsonData(e,t){sendAjaxRequest(e,"GET").then(e=>{t(e)}).catch(e=>{$(".ajaxErrorMessage").css("display","flex"),$(".ajaxErrorMessage h2").html(e),$(".ajaxErrorMessage button").click(function(){$(".ajaxErrorMessage").css("display","none")})})}$(document).ready(function(){$(".preloader").css("display","none");let e=window.location.pathname;BASEURL="index"==(currentPage="l"!==e[e.length-1]||e.includes("index")?"index":e.substring(1).split(".")[0])?"assets/":"../assets/";let t="";if("index"===(currentPage="index"==currentPage?currentPage:currentPage.split("/")[currentPage.split("/").length-1])){waitForPromiseAndRunFunctionWithJsonData("impressionPosts.json",function e(t){let r=document.querySelector(".impressions");t.forEach(e=>{r.innerHTML+=`
                <div class="impression">
                    <img src="assets/images/homePage/impressionsCustomers/${e.image.path}" alt="${e.image.alt}"/>
                    <p>${e.postText}</p>                
                    <h4>${e.personName}</h4>
                    <p class="impression-date">${e.postDate}</p>
                    <i class="zmdi zmdi-quote"></i>
                </div>`})});let r=document.querySelector(".impressions"),o=document.querySelector("#nextBtn"),a=document.querySelector("#prev"),s=getComputedStyle(r).width;s=s.substring(0,s.length-2);let n,i=0;o.addEventListener("click",()=>{i<(n=c()).length-1&&(i++,n.forEach(e=>{e.style.transform=`translateX(-${s*i}px)`}))}),a.addEventListener("click",()=>{n=c(),i>0&&(i--,n.forEach(e=>{e.style.transform=`translateX(-${s*i}px)`}))});let l=document.querySelectorAll("#services .row");function c(){return document.querySelectorAll(".impression")}waitForPromiseAndRunFunctionWithJsonData("serviceInfos.json",function e(t){t.forEach(e=>{e.id<3?l[0].innerHTML+=r(e):l[1].innerHTML+=r(e)});function r(e){return`<div class="col col-lg-5 col-md-5 col-sm-12 col-12 service">
                            <div class="text">
                                <h4>${e.infoName}</h4>
                                <p>${e.infoText}</p>
                            </div>
                            ${e.icon}
                        </div>`}})}if("shop"===currentPage){waitForPromiseAndRunFunctionWithJsonData("books.json",function e(t){addToLocalStorage("allBooks",JSON.stringify(t)),p(t)}),waitForPromiseAndRunFunctionWithJsonData("genres.json",function e(t){var r;let o;f((r=t,addToLocalStorage("allGenres",JSON.stringify(r)),o='<hr class="line"/><h3>Genres:</h3>',r.forEach(e=>{o+=`
                <div class="form-field">
                    <input type="checkbox" name="chbGenre${e.id}" id="chbGenre${e.id}" value="${e.id}"/>
                    <label for="chbGenre${e.id}">${makeFirstLetterUpercase(e.name)}</label>
                </div>`}),o));f(function e(){let t='<hr class="line"/><h3>Discaunts</h3>';for(let r=10;r<51;r+=10)t+=`
                <div class="form-field">
                    <input type="checkbox" name="chbDiscaunt${r}" id="chbDiscaunt${r}" value="${r}"/>
                    <label for="chbDiscaunt${r}">${r}% or More</label>
                </div>`;return t}());f(`<hr class="line"/><h3>Price: </h3><div class="priceRange">
                <input type="number" name="minPrice" min="0" max="5000" step="100" placeholder="Min price"/>
                <input type="number" name="maxPrice" min="1" max="5000" step="100" placeholder="Max price"/>
                <p class="error">Invalid price format , max is 5000RSD</p>
            </div><hr class="line"/>`)}),loadBooksInCartOrFavouritesFromLocalStorage("booksInCart"),loadBooksInCartOrFavouritesFromLocalStorage("favouriteBooks");document.querySelector("#filterBtn").addEventListener("click",()=>{let e=Array.from(document.querySelectorAll('input[name^="chbGenre"]:checked')),r=document.querySelector('input[name^="chbDiscaunt"]:checked'),o=+document.querySelector('.priceRange input[name="maxPrice"]').value,a=+document.querySelector('.priceRange input[name="minPrice"]').value,s=JSON.parse(localStorage.getItem("currentlyVisibleBooks")),n=s;t="",(e.length||r||o||a)&&(e.length&&(n=s.filter(t=>!!t.genres.some(t=>{var r,o;return r=e,o=t,!!r.some(e=>+e.value==+o)}))),r&&(n=n.filter(e=>e.price.discaunt>=r.value)),(o||a)&&(o>a&&o>1&&o<=5e3&&a>=0&&a<5e3?($(".priceRange p.error").slideUp("slow"),n=n.filter(e=>{let t=e.price.oldPrice;return e.price.discaunt&&(t=getNewBookPrice(e)),!!(t<o)&&!!(t>a)})):$(".priceRange p.error").slideDown("slow")),t="f"),$(".books p.empty").css("display","none"),0==n.length&&$(".books p.empty").slideDown("slow"),p(n),$(".filter").removeClass("visible")}),$("#showHideFilter").click(function(){let e=document.querySelector(".filter");e.style.display="flex",setTimeout(()=>{e.classList.contains("visible")?e.classList.remove("visible"):e.classList.add("visible")},1)});let u=document.querySelector("#ddlSort");u.addEventListener("change",()=>{let e=u.options[u.selectedIndex].value,t=JSON.parse(localStorage.getItem("currentlyVisibleBooks"));switch(localStorage.getItem("filteredBooks")&&(t=JSON.parse(localStorage.getItem("filteredBooks"))),e){case"priceAsc":t=m(t,"a");break;case"priceDesc":m(t,"d");break;case"titleAsc":h(t,"a");break;case"titleDesc":h(t,"d");break;case"new":var r;r=t,r.sort((e,t)=>{let r;return e.dateOfPublishing>t.dateOfPublishing?-1:1})}p(t)});let d=document.querySelector("#closePopupBtn");d.addEventListener("click",()=>{closePopup(T)});function p(e){var r;let o="",a;(a=document.querySelectorAll(".book")).length&&a.forEach(e=>{e.remove()}),e.length&&(e.forEach((e,t)=>{o+=`
                    <article class="book">
                    <img src="${BASEURL}images/shop/${e.image.path}" alt="${e.image.alt}"/>
                    <h3 class="title">${e.title}</h3>
                    <div class="bottom">
                    ${createPriceParagraphs(e)}
                    <div class="cartFav">
                        <button class="addToCartBtn" onclick="addToCartOrFavourites(event)">
                            <i class="zmdi zmdi-shopping-cart-plus"></i>
                        </button>
                        <button class="addToFavouritesBtn" onclick="addToCartOrFavourites(event)">
                            <i class="zmdi zmdi-favorite-outline"></i>
                        </button>
                    </div>
                    <div class="seeMore">
                        <button class="seeMoreBtn" onclick="seeMoreAboutBook(${e.id})">
                            See more...
                        </button>
                    </div>
                    </article>`}),$(o).insertAfter(".sectionHeader"),r=e,"f"===t?addToLocalStorage("filteredBooks",JSON.stringify(r)):(localStorage.getItem("filteredBooks")&&localStorage.removeItem("filteredBooks"),addToLocalStorage("currentlyVisibleBooks",JSON.stringify(r))),document.querySelectorAll(".book").length?$(".books p.empty").fadeOut("slow"):$(".books p.empty").fadeIn("slow"),disableCartBtnsForBooksThatAreInCartOrFavourites("booksInCart",".addToCartBtn"),disableCartBtnsForBooksThatAreInCartOrFavourites("favouriteBooks",".addToFavouritesBtn"))}function f(e){$(e).insertBefore(".filter form #filterBtn")}function m(e,t){return e.sort((e,r)=>{let o=getNewBookPrice(e),a=getNewBookPrice(r);return"a"==t?v(o,a):g(o,a)})}function h(e,t){return e.sort((e,r)=>{let o=e.title,a=r.title;return"a"==t?v(o,a):g(o,a)})}function v(e,t){return e>t?1:e<t?-1:0}function g(e,t){return e>t?-1:e<t?1:0}document.querySelector("#buyBtn").addEventListener("click",()=>{let e=JSON.parse(localStorage.getItem("booksInCart"));e&&($(".buyFromCartMessage").addClass("visible"),e.forEach(e=>{enableCartBtnsForBooksThatAreInCartOrFavourites(e.title,".addToCartBtn")}),$("tbody tr").remove(),updateCartInterface())}),$(".closePopupMessage").click(function(){$(".buyFromCartMessage").removeClass("visible")}),$(".addToCartMessagePopup button").click(function(){closePopup(document.querySelector(".addToCartMessagePopup"))})}if("contact"===currentPage){$("input").val="";let y=document.querySelector("#day");y.innerHTML+=C(1,31),document.querySelector("#month").innerHTML+=createSelectOptions(13),document.querySelector("#year").innerHTML+=C(1960,2005);let b=document.querySelector("#month");b.addEventListener("change",()=>{let e=b.options[b.selectedIndex].value,t="";switch(e){case"1":case"3":case"5":case"7":case"8":case"10":case"12":t=C(1,31);break;case"4":case"6":case"9":case"11":t=C(1,30);break;case"2":t=C(1,29)}y.innerHTML='<option value="0">Day</option>'+t});let k=document.querySelectorAll('.contactForm input[type="text"],.contactForm input[type="password"]');function S(e,t,r,o){e.setAttribute("type",r),t.innerHTML=`<i class="${o}"></i>`}function B(e){$("p."+e).addClass("visible"),$("p."+e).slideDown("slow")}function L(e){$("p."+e).removeClass("visible"),$("p."+e).slideUp("slow")}function q(e,t,r){var o,a;(o=e.value,(a=t).test(o))?L(r):B(r)}function C(e,t){let r="";for(let o=e;o<=t;o++)r+=`<option value="${o}">${o}</option>`;return r}k.forEach(e=>{let t=e.parentElement.querySelector("label");e.addEventListener("focus",()=>{t.classList.add("focused")}),e.addEventListener("blur",()=>{e.value||t.classList.remove("focused")})}),k.forEach(e=>{e.addEventListener("input",()=>{let t=e.value,r,o=e.getAttribute("name");switch(o){case"fName":case"lName":q(e,r=/^[A-Z][a-z]{2,10}$/,o);break;case"email":q(e,r=/^[a-z0-9.-]{4,20}@(gmail.com|yahoo.com)$/,o);break;case"password":case"confirmPass":r=/^[A-z0-9@#$-.]{8,20}$/,"password"==o&&(r.test(t)&&/[A-Z]/.test(t)&&(/[a-z]/.test(t)||/[0-9]{4,20}/.test(t))?L("password"):B("password")),$("#confirmPass").val()!=$("#password").val()?B("confirmPass"):L("confirmPass")}})}),$("#submitBtn").click(function(e){e.preventDefault(),Array.from($('.contactForm input[type="text"], .contactForm input[type="password"],textarea')).some(e=>""==e.value)?B("submitError"):L("submitError");document.querySelectorAll("#day , #month, #year").forEach(e=>{0==e.options[e.selectedIndex].value?B("dateOfBirth"):L("dateOfBirth")});document.querySelector('input[name="gender"]:checked')?L("gender"):B("gender");document.querySelector("#terms:checked")?L("terms"):B("terms");let t=document.querySelector('textarea[name="message"]');/^[A-Z][A-z0-9.-/\s]{8,40}$/.test(t.value)?L("message"):B("message");!Array.from($("p.error")).some(e=>e.classList.contains("visible"))&&openPopup(document.querySelector("#submitedForm"))}),$("#submitedForm .closeBtn").click(function(){closePopup(document.querySelector("#submitedForm")),document.querySelector(".contactForm form").reset()}),$(".hideShowBtn").click(function(e){e.preventDefault();let t=this.previousElementSibling;if("password"==t.getAttribute("type")){S(t,this,"text","zmdi zmdi-eye-off");return}S(t,this,"password","zmdi zmdi-eye")})}waitForPromiseAndRunFunctionWithJsonData("navigation.json",createNavLinks),waitForPromiseAndRunFunctionWithJsonData("socials.json",createSocialNetworkLinks);let P=document.querySelectorAll("#cartBtn , #favBtn"),T=document.querySelector(".popupCartFav");P.forEach(e=>{e.addEventListener("click",()=>{let t=document.querySelector(".favourites"),r=document.querySelector(".cart");A()&&("cartBtn"===e.getAttribute("id")?(r.classList.add("open"),t.classList.remove("open")):(r.classList.remove("open"),t.classList.add("open")),openPopup(T))})});document.querySelector("#searchBtn").addEventListener("click",e=>{if(e.preventDefault(),t="s",!A())return;let r=document.querySelector("#searchTxb").value,o=JSON.parse(localStorage.getItem("allBooks"));if($(".books p.empty").slideUp("slow"),r){let a=o.filter(e=>{if(e.title.toLowerCase().includes(r.toLowerCase()))return e});0==a.length&&$(".books p.empty").slideDown("slow"),p(a),localStorage.setItem("currentlyVisibleBooks",JSON.stringify(a))}else p(o)}),$(window).scroll(function(){window.scrollY>800?$("#toTop").css("display","block"):$("#toTop").css("display","none")}),$("#toTop button").click(()=>{$(window).scrollTop(0)});let F=document.querySelector(".hamburgerBtn button");function x(e){let t=e.children[1],r=e.children[0],o=e.children[2];t.classList.contains("fadeOut")?(t.classList.remove("fadeOut"),o.classList.remove("rotate1"),r.classList.remove("rotate2")):(t.classList.add("fadeOut"),o.classList.add("rotate1"),r.classList.add("rotate2"))}function A(){return"shop"===currentPage||("index"!==currentPage?window.location="shop.html":window.location="pages/shop.html",!1)}F.addEventListener("click",()=>{x(F);let e=document.querySelector("header .navigation");e.classList.contains("visible")?e.classList.remove("visible"):e.classList.add("visible")}),$(".navigation .closeNav").click(function(){document.querySelector("header .navigation").classList.remove("visible"),x(document.querySelector(".hamburgerBtn button"))})});