
import { useEffect, useState } from 'react'
import './App.css'

const images = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700',
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=700',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700',
  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=700'
]

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

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
    setMessage(`${product.name} added to cart`)
  }

  function removeFromCart(id) {
    setCart(current => current.filter(item => item.id !== id))
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity, 0
  )

  async function checkout() {
    if (!cart.length) return

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
      setMessage('Order placed and demo payment successful!')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#">CHRONO<span>.</span></a>
        <nav>
          <a href="#home">Home</a>
          <a href="#collection">Collection</a>
          <a href="#about">About</a>
        </nav>
        <a className="cart-link" href="#cart">
          Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </a>
      </header>

      <section className="hero" id="home">
        <div>
          <p className="eyebrow">TIMELESS DESIGN · MODERN CRAFT</p>
          <h1>Time is your<br /><span>signature.</span></h1>
          <p className="hero-copy">
            Discover watches designed for every moment
            that matters.
          </p>
          <a className="shop-button" href="#collection">
            Explore collection →
          </a>
        </div>
        <img
          src={images[0]}
          alt="Premium wristwatch"
          className="hero-image"
        />
      </section>

      <main id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>Our Collection</h2>
          </div>
          <span>{products.length} products</span>
        </div>

        {loading && <p>Loading products...</p>}

        {!loading && products.length === 0 && (
          <p>No products available. Check Product Service.</p>
        )}

        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <img
                  src={images[index % images.length]}
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-bottom">
                  <strong>₹{Number(product.price).toLocaleString('en-IN')}</strong>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? 'Out of stock' : 'Add to bag +'}
                  </button>
                </div>
                <small>{product.stock} in stock</small>
              </div>
            </article>
          ))}
        </div>
      </main>

      <section className="cart-section" id="cart">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>Shopping Bag</h2>
        </div>

        {cart.length === 0 ? (
          <p>Your bag is empty. Explore our collection.</p>
        ) : (
          <>
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <span>{item.name} × {item.quantity}</span>
                <strong>
                  ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                </strong>
                <button onClick={() => removeFromCart(item.id)}>
                  Remove
                </button>
              </div>
            ))}
            <h3>Total: ₹{total.toLocaleString('en-IN')}</h3>
            <button
              className="checkout-button"
              onClick={checkout}
              disabled={busy}
            >
              {busy ? 'Processing...' : 'Place order & pay'}
            </button>
          </>
        )}

        {message && <p className="message">{message}</p>}
      </section>

      <footer id="about">
        <span className="logo">CHRONO<span>.</span></span>
        <p>Timeless watches. Made for every moment.</p>
        <small>Demo e-commerce application · Portfolio project</small>
      </footer>
    </div>
  )
}

export default App