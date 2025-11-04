import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Shield, TrendingUp, CheckCircle, Loader, Star, Rocket } from 'lucide-react';

export default function FloundeRx() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [totalRaised, setTotalRaised] = useState(14395);

  useEffect(() => {
    const total = orders.reduce((sum, order) => sum + order.amount, 2795);
    setTotalRaised(total);
  }, [orders]);

  const handlePreOrder = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !amount || !cardName || !cardNumber || !expiry || !cvc) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) < 10) {
      setError('Minimum pre-order is $5');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://flounderx-backend-production.up.railway.app';

      const paymentIntentRes = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          amount: parseFloat(amount),
          cardName 
        })
      });

      if (!paymentIntentRes.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await paymentIntentRes.json();

      const confirmRes = await fetch(`${API_URL}/api/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: clientSecret.split('_secret_')[0],
          cardToken: {
            card: {
              number: cardNumber.replace(/\s/g, ''),
              exp_month: expiry.split('/')[0],
              exp_year: '20' + expiry.split('/')[1],
              cvc
            }
          },
          email,
          amount: parseFloat(amount),
          cardName
        })
      });

      const confirmData = await confirmRes.json();

      if (confirmData.success) {
        const newOrder = {
          id: confirmData.order.id,
          email,
          amount: parseFloat(amount),
          date: new Date().toLocaleDateString(),
          cardLast4: cardNumber.slice(-4),
          bonus: (parseFloat(amount) * 0.2).toFixed(2)
        };
        
        setOrders([...orders, newOrder]);
        setEmail('');
        setAmount('');
        setCardName('');
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setPaymentSuccess(true);
        setSubmitted(true);
        
        setTimeout(() => {
          setSubmitted(false);
          setPaymentSuccess(false);
        }, 4000);
      } else {
        setError(confirmData.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500 via-purple-600 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-600 via-pink-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500 to-transparent rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="backdrop-blur-xl bg-black/40 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Rocket className="text-cyan-400" size={32} />
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                FloundeRx
              </div>
            </div>
            <div className="hidden md:flex gap-8 items-center">
              <a href="#features" className="hover:text-cyan-400 transition duration-300 font-semibold">Features</a>
              <a href="#preorder" className="hover:text-cyan-400 transition duration-300 font-semibold">Pre-Order</a>
              <a href="#orders" className="hover:text-cyan-400 transition duration-300 font-semibold">Orders</a>
              <div className="text-sm text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text font-bold">
                ${totalRaised.toFixed(2)} Raised
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 md:px-12 py-32 text-center relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-20 h-20 border border-cyan-400 rounded-lg animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 border border-purple-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 backdrop-blur-sm">
              <Star size={16} className="text-cyan-400" />
              <span className="text-sm text-cyan-400 font-semibold">Join the Revolution</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block">The Future of</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Digital Assets
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Be an early adopter. Secure your coins now and get a <span className="text-cyan-400 font-bold">20% launch bonus</span> before FloundeRx goes live.
            </p>

            <button 
              onClick={() => document.getElementById('preorder').scrollIntoView({behavior: 'smooth'})}
              className="group relative inline-flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-xl overflow-hidden transition transform hover:scale-110 duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse"></div>
              <div className="absolute inset-1 bg-black rounded-lg"></div>
              <div className="relative flex items-center gap-3">
                <Rocket size={24} />
                Start Pre-Order
                <ArrowRight size={24} className="group-hover:translate-x-2 transition" />
              </div>
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 md:px-12 py-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="backdrop-blur-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 p-8 rounded-2xl text-center hover:border-cyan-400/50 transition">
            <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
              {orders.length}+
            </div>
            <p className="text-gray-300 text-sm">Early Supporters</p>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 p-8 rounded-2xl text-center hover:border-purple-400/50 transition">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
              ${totalRaised.toFixed(0)}
            </div>
            <p className="text-gray-300 text-sm">Total Raised</p>
          </div>
          <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-cyan-500/10 border border-pink-400/20 p-8 rounded-2xl text-center hover:border-pink-400/50 transition">
            <div className="text-4xl font-black bg-gradient-to-r from-pink-400 to-cyan-500 bg-clip-text text-transparent mb-2">
              20%
            </div>
            <p className="text-gray-300 text-sm">Launch Bonus</p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 md:px-12 py-24 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Transaction speeds optimized for maximum performance', color: 'from-cyan-400 to-blue-500' },
            { icon: Shield, title: 'Bank-Grade Security', desc: 'Military-grade encryption protecting your assets', color: 'from-purple-400 to-pink-500' },
            { icon: TrendingUp, title: 'Sustainable Growth', desc: 'Transparent tokenomics for long-term value', color: 'from-green-400 to-emerald-500' }
          ].map((feature, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/30 transition duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition duration-300`}></div>
              <div className="backdrop-blur-xl bg-white/5 p-8 relative">
                <feature.icon className={`mb-4 text-2xl bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} size={40} />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Pre-Order Section */}
        <section id="preorder" className="px-6 md:px-12 py-24">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
              <div className="relative backdrop-blur-2xl bg-black/60 border border-cyan-400/30 p-12 rounded-3xl">
                <h2 className="text-5xl font-black mb-3 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Secure Your Coins
                </h2>
                <p className="text-center text-gray-300 mb-10 text-sm">Lock in early access with a 20% launch bonus</p>
                
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition placeholder-gray-500 text-white backdrop-blur-sm"
                    />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Amount (USD)"
                      min="10"
                      step="10"
                      className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition placeholder-gray-500 text-white backdrop-blur-sm"
                    />
                  </div>

                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Cardholder Name"
                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition placeholder-gray-500 text-white backdrop-blur-sm"
                  />

                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                    className="w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition placeholder-gray-500 text-white backdrop-blur-sm font-mono"
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="12/25"
                      maxLength="5"
                      className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition placeholder-gray-500 text-white backdrop-blur-sm"
                    />
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.slice(0, 3))}
                      placeholder="CVC"
                      maxLength="3"
                      className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none transition placeholder-gray-500 text-white backdrop-blur-sm"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-300 text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handlePreOrder}
                    disabled={loading}
                    className="w-full group relative overflow-hidden px-6 py-4 text-base font-bold rounded-xl transition transform hover:scale-105 disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 animate-pulse"></div>
                    <div className="absolute inset-1 bg-black rounded-lg group-hover:bg-black/80 transition"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Complete Payment
                        </>
                      )}
                    </div>
                  </button>

                  <p className="text-center text-xs text-gray-500">🔒 Secure • Encrypted • PCI Compliant</p>
                </div>

                {submitted && paymentSuccess && (
                  <div className="mt-6 p-5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl text-center font-bold text-green-300 animate-pulse">
                    ✓ Payment successful! Check your email for details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Orders Display */}
        {orders.length > 0 && (
          <section id="orders" className="px-6 md:px-12 py-24 max-w-4xl mx-auto">
            <h2 className="text-4xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Recent Pre-Orders
            </h2>
            <div className="space-y-4">
              {orders.slice().reverse().map((order, i) => (
                <div key={order.id} className="group relative backdrop-blur-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/10 hover:border-cyan-400/30 p-6 rounded-2xl flex justify-between items-center transition transform hover:scale-105">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{order.email}</p>
                    <p className="text-sm text-gray-400">{order.date} • Card ending in {order.cardLast4}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                      ${order.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-green-400 font-bold">+${order.bonus} bonus</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        <section className="px-6 md:px-12 py-24 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-12 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              About FloundeRx
            </h2>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <p className="text-lg">
                At <span className="text-white font-bold">FloundeRx</span>, we're redefining what it means to play, build, and earn. Our team of passionate developers is creating a next-generation gaming ecosystem — one where players truly share in the success. We're not just building games; we're building a <span className="text-cyan-400 font-semibold">movement powered by innovation, community, and ownership</span>.
              </p>

              <p>
                To kick off our journey, we're hosting <span className="text-purple-400 font-semibold">one of the biggest giveaways in gaming history</span> — giving away <span className="font-bold">50% of our company and 50% of all FloundeRx Coins</span> to five lucky winners. Every game is free to play and ad-light, and at any moment, a player could be rewarded with the <span className="text-yellow-400 font-semibold">Golden FloundeRx Coin</span>. When that happens, their name is broadcast across all our apps, and they instantly secure <span className="font-bold">10% of our total coin supply</span> along with a share of the revenue from ads, purchases, and in-game sales.
              </p>

              <p>
                Once the fifth Golden Coin is awarded, the FloundeRx Coin officially goes public — and from that point forward, no gambling elements are allowed. Each winner becomes part of <span className="text-cyan-400 font-semibold">FloundeRx's foundation</span>, sharing in what could be one of the smartest investments of their lifetime.
              </p>

              <p>
                We currently have <span className="font-bold">10 fully developed apps</span> ready to launch, each powered by our coin economy. Players can earn, trade, or sell coins back to FloundeRx to unlock levels, exclusive content, and upgrades — creating a <span className="text-green-400 font-semibold">sustainable, player-first ecosystem</span> that grows with every interaction.
              </p>

              <p>
                We're also looking for driven developers and creators who believe in what we're building. This isn't just a job — it's a chance to <span className="text-purple-400 font-semibold">shape the future of gaming</span> alongside a team that's hungry, devoted, and ready to make history.
              </p>

              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 p-8 rounded-2xl mt-8">
                <p className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center">
                  Play. Earn. Own. Evolve.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-16 border-t border-white/10 text-center text-gray-400 backdrop-blur-xl">
          <p className="text-lg font-bold mb-2">FloundeRx - The Future is Now</p>
          <p className="text-sm mb-6">Coming Soon | Test: 4242 4242 4242 4242</p>
          <p className="text-xs text-gray-500">© 2025 FloundeRx. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}