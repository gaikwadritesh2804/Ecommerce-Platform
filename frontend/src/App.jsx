
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const productImages = {
  headphone: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  speaker: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
  watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  smartwatch: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
  camera: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  default: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800'
}

function getProductImage(name = '') {
  const value = name.toLowerCase()

  if (value.includes('headphone') || value.includes('earbud') || value.includes('earphone')) return productImages.headphone
  if (value.includes('speaker')) return productImages.speaker
  if (value.includes('smart watch') || value.includes('smartwatch')) return productImages.smartwatch
  if (value.includes('watch')) return productImages.watch
  if (value.includes('laptop')) return productImages.laptop
  if (value.includes('keyboard')) return productImages.keyboard
  if (value.includes('camera')) return productImages.camera

  return productImages.default
}

function getCategory(name = '') {
  const value = name.toLowerCase()

  if (/headphone|earbud|earphone|speaker/.test(value)) return 'Audio'
  if (/watch|fitness band/.test(value)) return 'Wearables'
  return 'Accessories'
}

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  async function loadProducts() {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Unable to load products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = `${product.name} ${product.description || ''}`
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesCategory =
        category === 'All' || getCategory(product.name) === category

      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  )

  function addToCart(product) {
    setCart(current => {
      const existing = current.find(item => item.id === product.id)

      if (existing) {
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...current, { ...product, quantity: 1 }]
    })

    setMessage(`${product.name} added to your cart`)
  }

  function updateQuantity(id, change) {
    setCart(current =>
      current
        .map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter(item => item.quantity > 0)
    )
  }

  function removeFromCart(id) {
    setCart(current => current.filter(item => item.id !== id))
  }

  async function checkout() {
    if (!cart.length || busy) return

    setBusy(true)
    setMessage('')

    try {
      for (const item of cart) {
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            productId: item.id,
            quantity: item.quantity
          })
        })

        if (!orderResponse.ok) throw new Error('Order creation failed')

        const order = await orderResponse.json()

        const paymentResponse = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: Number(item.price) * item.quantity,
            paymentMethod: 'CARD'
          })
        })

        if (!paymentResponse.ok) {
          throw new Error('Payment creation failed')
        }
      }

      setCart([])
      setMessage('Order placed successfully! Demo payment completed.')
      loadProducts()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <div className="announcement">
        <span>THE NEXT GENERATION OF EVERYDAY TECH</span>
        <span>Discover something extraordinary ✦</span>
      </div>

      <header className="navbar">
        <a className="logo" href="#home">NEXORA<span>.</span></a>

        <nav>
          <a href="#home">Home</a>
          <a href="#collection">Shop</a>
          <a href="#about">About</a>
        </nav>

        <a className="cart-link" href="#cart">
          <span>Bag</span>
          <span className="cart-count">{cartCount}</span>
        </a>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="hero-tag">TECH THAT MOVES YOU</span>
          <h1>Upgrade your<br />everyday<span>.</span></h1>
          <p>
            Discover thoughtfully selected technology.
            From immersive audio to smart everyday essentials.
          </p>
          <a className="primary-button" href="#collection">
            Explore products <span>↗</span>
          </a>

          <div className="hero-stats">
            <div><strong>01</strong><small>Explore</small></div>
            <div><strong>02</strong><small>Discover</small></div>
            <div><strong>03</strong><small>Experience</small></div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000"
            alt="Premium headphones"
          />
          <div className="hero-floating-card">
            <span>CURATED TECH</span>
            <strong>Made for your world.</strong>
          </div>
          <span className="hero-decoration">N° 001 — NEXORA COLLECTION</span>
        </div>
      </section>

      <section className="benefits">
        <div><span>✦</span><p>Carefully selected products</p></div>
        <div><span>↗</span><p>Modern everyday technology</p></div>
        <div><span>◎</span><p>Simple and secure demo checkout</p></div>
      </section>

      <main id="collection">
        <div className="collection-top">
          <div>
            <span className="section-tag">THE NEXORA EDIT</span>
            <h2>Find your next favourite.</h2>
            <p>Technology designed to fit your lifestyle.</p>
          </div>
          <span className="product-count">
            {filteredProducts.length} PRODUCTS
          </span>
        </div>

        <div className="shop-controls">
          <div className="category-list">
            {['All', 'Audio', 'Wearables', 'Accessories'].map(item => (
              <button
                key={item}
                className={category === item ? 'category-button active' : 'category-button'}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>
        </div>

        {loading && <p className="status-message">Loading your collection...</p>}

        {!loading && products.length === 0 && (
          <p className="status-message">No products available. Please check Product Service.</p>
        )}

        {!loading && products.length > 0 && filteredProducts.length === 0 && (
          <p className="status-message">No matching products found. Try another search.</p>
        )}

        <div className="product-grid">
          {filteredProducts.map((product, index) => (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <span className="product-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <img
                  src={getProductImage(product.name)}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
                <span className="product-category">{getCategory(product.name)}</span>
              </div>

              <div className="product-info">
                <div className="product-title-row">
                  <h3>{product.name}</h3>
                  <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>
                </div>
                <p>{product.description || 'Discover this product from the Nexora collection.'}</p>

                <div className="product-bottom">
                  <small>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </small>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? 'Unavailable' : 'Add to bag +'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <section className="promo-banner">
        <div>
          <span className="section-tag">A BETTER EVERYDAY STARTS HERE</span>
          <h2>Good technology.<br />Better experiences.</h2>
        </div>
        <a href="#collection">Discover the collection ↗</a>
      </section>

      <section className="cart-section" id="cart">
        <div className="cart-heading">
          <div>
            <span className="section-tag">YOUR SELECTION</span>
            <h2>Your shopping bag.</h2>
          </div>
          <span>{cartCount} ITEMS</span>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <span>◇</span>
            <p>Your bag is waiting for something great.</p>
            <a href="#collection">Explore products ↗</a>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div className="cart-item" key={item.id}>
                  <img src={getProductImage(item.name)} alt={item.name} />
                  <div className="cart-item-details">
                    <strong>{item.name}</strong>
                    <small>₹{Number(item.price).toLocaleString('en-IN')}</small>
                  </div>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.stock}
                    >+</button>
                  </div>

                  <strong className="cart-subtotal">
                    ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                  </strong>
                  <button className="remove-button" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-total">
              <div>
                <span>Subtotal</span>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
              <small>Demo checkout · Payments are simulated</small>
              <button className="checkout-button" onClick={checkout} disabled={busy}>
                {busy ? 'Processing order...' : 'Continue to checkout →'}
              </button>
            </div>
          </>
        )}

        {message && <p className="message">{message}</p>}
      </section>

      <footer id="about">
        <a className="logo footer-logo" href="#home">NEXORA<span>.</span></a>
        <p>Technology for the way you live.</p>
        <div className="footer-bottom">
          <span>© 2026 NEXORA. Portfolio project.</span>
          <span>Built with React · Spring Boot · Kubernetes</span>
        </div>
      </footer>
    </div>
  )
}

export default App
