# Graph Report - .  (2026-07-16)

## Corpus Check
- Large corpus: 297 files · ~625,554 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1354 nodes · 2303 edges · 140 communities (108 shown, 32 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 305 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Popper & Moment.js Utilities
- jQuery Core Library
- Summernote Rich Text Editor
- WebFont & Moment Extensions
- DataTables Plugin
- NPM Dependencies & Config
- Gallery Controller
- Product Prices Controller
- Profile Controller
- Access Control (Akses)
- Sortable Plugin
- Product Flight & Models
- App Entry & Routing
- Product Routes & Middleware
- Product Facilities Controller
- Product Hotel Controller
- Product Itinerary Controller
- Category Repository
- JWT Authentication Middleware
- Product Repository
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Transaction Service
- Community 57
- Community 58
- Community 59
- Community 60
- Community 62
- Community 63
- Community 64
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 72
- Community 73
- Community 74
- Community 93
- Community 94
- Community 96
- Community 97
- Community 98
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130

## God Nodes (most connected - your core abstractions)
1. `error()` - 32 edges
2. `b()` - 26 edges
3. `c()` - 22 edges
4. `d()` - 19 edges
5. `a()` - 18 edges
6. `t()` - 17 edges
7. `n()` - 17 edges
8. `ht()` - 17 edges
9. `tb()` - 17 edges
10. `y()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `loadCategory()` --indirect_call--> `error()`  [INFERRED]
  public/javascripts/createProduct_javascript.js → utils/response.js
- `PU Marketplace Project` --references--> `PengenUmroh Logo`  [INFERRED]
  README.md → public/assets/img/logo/pengenumroh.png
- `loadSidebar()` --indirect_call--> `error()`  [INFERRED]
  middleware/loadSidebar.js → utils/response.js
- `h()` --indirect_call--> `T()`  [INFERRED]
  public/assets/js/plugin/sortable/sortable.min.js → public/assets/js/plugin/datatables/datatables.min.js
- `eb()` --indirect_call--> `Se()`  [INFERRED]
  public/assets/js/plugin/moment/moment.min.js → public/assets/js/plugin/summernote/summernote-lite.min.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Product Media Assets** — public_assets_img_gallery_gallery_images, public_assets_img_hotels_hotel_images, public_assets_img_products_thumbnails_thumbnail_images [INFERRED 0.85]

## Communities (140 total, 32 thin omitted)

### Community 0 - "Popper & Moment.js Utilities"
Cohesion: 0.05
Nodes (105): de(), a(), aa(), ab(), ac(), b(), ba(), bb() (+97 more)

### Community 1 - "jQuery Core Library"
Cohesion: 0.07
Nodes (69): A(), Ae(), B(), Be(), c(), $e(), ee(), F() (+61 more)

### Community 2 - "Summernote Rich Text Editor"
Cohesion: 0.06
Nodes (33): a(), at(), bt(), ct(), d(), dt(), E(), et() (+25 more)

### Community 3 - "WebFont & Moment Extensions"
Cohesion: 0.08
Nodes (38): za(), A(), aa(), B(), C(), da(), E(), ea() (+30 more)

### Community 4 - "DataTables Plugin"
Cohesion: 0.13
Nodes (48): A(), at(), b(), bt(), c(), ct(), d(), dt() (+40 more)

### Community 5 - "NPM Dependencies & Config"
Cohesion: 0.04
Nodes (46): autoprefixer, bcrypt, concurrently, cors, dotenv, ejs, express, express-session (+38 more)

### Community 6 - "Gallery Controller"
Cohesion: 0.06
Nodes (21): fs, GalleryController, GalleryRepository, GalleryService, path, { success }, { Gallery }, GalleryRepository (+13 more)

### Community 7 - "Product Prices Controller"
Cohesion: 0.09
Nodes (12): productPriceRepository, ProductPricesController, createListItem(), fillFormData(), loadCategory(), updateRoadmapOrder(), { ProductPrices }, ProductPricesRepository (+4 more)

### Community 8 - "Profile Controller"
Cohesion: 0.07
Nodes (15): ProfileController, profileRepo, response, {Model, where}, { Profile, User }, ProfileRepository, diskStorage, {ensureAuthToken} (+7 more)

### Community 9 - "Access Control (Akses)"
Cohesion: 0.08
Nodes (9): AksesController, aksesService, response, aksesController, express, router, { Akses, Menu }, AksesRepository (+1 more)

### Community 10 - "Sortable Plugin"
Cohesion: 0.11
Nodes (12): a(), b(), c(), d(), e(), f(), h(), i() (+4 more)

### Community 11 - "Product Flight & Models"
Cohesion: 0.11
Nodes (15): productFlightRepository, ProductService, { sequelize }, basename, db, fs, path, Sequelize (+7 more)

### Community 12 - "App Entry & Routing"
Cohesion: 0.10
Nodes (17): allowedOrigins, app, authRoutes, bodyParser, cors, express, extractJwt, fs (+9 more)

### Community 13 - "Product Routes & Middleware"
Cohesion: 0.10
Nodes (19): appSignature, diskStrorage, {ensureAuthToken}, express, FILE_TYPE, { injectUser }, multer, path (+11 more)

### Community 14 - "Product Facilities Controller"
Cohesion: 0.13
Nodes (8): ProductFacilityController, productFacilityRepository, productFacilityService, ProductService, { ProductFacility }, ProductFacilityRepository, ProductFacilityRepository, ProductFacilityService

### Community 15 - "Product Hotel Controller"
Cohesion: 0.11
Nodes (7): ProductHotelController, productHotelRepository, ProductService, { ProductHotel,  ProductHotelFaciility}, ProductHotelRepository, ProductHotelRepository, ProductHotelService

### Community 16 - "Product Itinerary Controller"
Cohesion: 0.13
Nodes (7): ProductItineraryController, productItineraryRepository, ProductService, { ProductItinerary }, ProductItineraryRepository, ProductItineraryRepository, ProductItineraryService

### Community 17 - "Category Repository"
Cohesion: 0.17
Nodes (8): { Category }, CategoryRepository, { Model, Op }, { auth, loadSidebar }, categoryRepo, categoryRepository, express, router

### Community 18 - "JWT Authentication Middleware"
Cohesion: 0.17
Nodes (11): ensureAuthToken(), { verifyToken }, { verifyToken }, {ensureAuthToken}, express, { injectUser }, productWishlistController, router (+3 more)

### Community 19 - "Product Repository"
Cohesion: 0.12
Nodes (6): { Model, Op, where, col, Transaction }, { Product, ProductPrices, ProductFlight, ProductHotel, ProductFacility, ProductItinerary, ProductSnK, ProductNote, Akses, User }, ProductRepository, productRepo, { sequelize, Transaction, TransactionDetail, ProductPrices }, transactionRepo

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (6): ProductService, productSnKRepository, { ProductSnK }, ProductSnKRepository, ProductSnKRepository, ProductSnKService

### Community 21 - "Community 21"
Cohesion: 0.24
Nodes (6): ProductWishlistController, productWishlistService, { success, created, error, notFound }, created(), notFound(), success()

### Community 22 - "Community 22"
Cohesion: 0.14
Nodes (13): { auth, loadSidebar }, ejs, express, { formatTransaction }, fs, logoBuffer, path, pdf (+5 more)

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (5): handleServerError(), ProductController, productService, { response }, error()

### Community 24 - "Community 24"
Cohesion: 0.18
Nodes (7): AuthController, authService, { generateToken }, jwt, path, { success }, generateToken()

### Community 25 - "Community 25"
Cohesion: 0.46
Nodes (12): a(), b(), c(), d(), e(), f(), g(), h() (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.55
Nodes (11): a(), c(), e(), f(), i(), l(), n(), o() (+3 more)

### Community 27 - "Community 27"
Cohesion: 0.14
Nodes (4): ProductWishlistRepository, {
  Wishlist,
  Product,
  ProductHotel,
  ProductPrices,
  ProductFlight,
}, ProductWishlistService, repository

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (12): { ensureAuth }, express, { injectUser }, menuController, { route }, router, authController, { ensureAuthToken } (+4 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (9): DashboardController, ProductRepository, response, { Transaction, User }, TransactionRepository, UserRepository, DashboardController, express (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (5): { hashPassword }, response, UserController, UserRepository, hashPassword()

### Community 33 - "Community 33"
Cohesion: 0.18
Nodes (9): aksesRepo, menuRepo, response, userlevelRepo, { Akses, Menu }, { where }, aksesRepository, { Op } (+1 more)

### Community 34 - "Community 34"
Cohesion: 0.17
Nodes (9): { ensureAuth }, express, { injectUser }, router, userlevelController, { ensureAuth, restrictToAdmin }, express, loadSidebar (+1 more)

### Community 35 - "Community 35"
Cohesion: 0.21
Nodes (4): {ProductFlight}, ProductFlightRepository, ProductFlightRepository, ProductFlightService

### Community 36 - "Community 36"
Cohesion: 0.23
Nodes (5): { ProductHotelFacility }, ProductHotelFacilityRepository, { where }, FacilityRepo, ProductHotelFacilityService

### Community 37 - "Community 37"
Cohesion: 0.21
Nodes (9): bcrypt, { comparePassword }, { getIO }, login(), { sequelize }, updatePassword(), userRepository, bcrypt (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (10): appSignature, crypto, {ensureAuthToken}, express, { injectUser }, multer, router, storage (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.20
Nodes (7): CategoryRepository, CategoryService, { success }, CategoryController, express, { injectUser }, router

### Community 43 - "Community 43"
Cohesion: 0.20
Nodes (8): { auth, loadSidebar }, express, { link }, router, { auth, loadSidebar }, express, router, Transaction

### Community 44 - "Community 44"
Cohesion: 0.20
Nodes (9): productFacilityRepository, productFlightRepository, productHotelRepository, productItineraryRepository, productNoteRepository, productPricesRepository, productRepository, productSnKRepository (+1 more)

### Community 45 - "Community 45"
Cohesion: 0.31
Nodes (4): productNoteRepository, ProductService, { ProductNote }, ProductNoteRepository

### Community 47 - "Community 47"
Cohesion: 0.22
Nodes (6): { auth, loadSidebar }, express, router, { auth, loadSidebar,  }, express, router

### Community 49 - "Community 49"
Cohesion: 0.22
Nodes (7): { Model, Op }, { User, Userlevel, UserNotification, Profile }, { auth, loadSidebar}, express, router, UserlevelRepo, UserRepo

### Community 50 - "Community 50"
Cohesion: 0.22
Nodes (7): { Op }, { sequelize, Userlevel, Akses }, { auth, loadSidebar }, express, router, UserlevelRepo, UserRepo

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (5): aksesRepo, { mapMenuWithAcces }, menuRepo, response, mapMenuWithAcces()

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (3): imageInput, previewImage, uploadBox

### Transaction Service - "Transaction Service"
Cohesion: 0.29
Nodes (5): response, transactionRepo, transactionService, { Op, where, col }, { Transaction, User, TransactionDetail, Product, Profile }

### Community 57 - "Community 57"
Cohesion: 0.29
Nodes (5): appSignature, express, { injectUser }, router, userController

### Community 60 - "Community 60"
Cohesion: 0.53
Nodes (5): buildTree(), loadSidebar(), markActive(), { Menu, Akses}, normalizePath()

### Community 62 - "Community 62"
Cohesion: 0.33
Nodes (5): diskStrorage, FILE_TYPE, multer, path, upload

### Community 67 - "Community 67"
Cohesion: 0.40
Nodes (4): { auth, loadSidebar }, express, MenuRepo, router

### Community 68 - "Community 68"
Cohesion: 0.40
Nodes (4): { auth, loadSidebar }, express, MenuRepo, router

## Knowledge Gaps
- **323 isolated node(s):** `express`, `cors`, `bodyParser`, `fs`, `path` (+318 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `error()` connect `Community 23` to `Community 32`, `Community 69`, `Gallery Controller`, `Product Prices Controller`, `Profile Controller`, `Community 73`, `Community 74`, `Community 40`, `Product Facilities Controller`, `Product Hotel Controller`, `Product Itinerary Controller`, `Community 46`, `Community 51`, `Community 21`, `Community 55`, `Community 24`, `Community 60`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `ht()` connect `DataTables Plugin` to `WebFont & Moment Extensions`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `za()` connect `WebFont & Moment Extensions` to `Popper & Moment.js Utilities`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Are the 25 inferred relationships involving `error()` (e.g. with `.getAllCategoryDatatables()` and `.getAllGalleryDatatables()`) actually correct?**
  _`error()` has 25 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `b()` (e.g. with `ac()` and `k()`) actually correct?**
  _`b()` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 13 inferred relationships involving `c()` (e.g. with `bc()` and `da()`) actually correct?**
  _`c()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `d()` (e.g. with `ca()` and `fc()`) actually correct?**
  _`d()` has 14 INFERRED edges - model-reasoned connections that need verification._