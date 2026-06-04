import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageUploader from '../components/auction/ImageUploader';
import { auctionAPI } from '../services/api';

const CATEGORIES = [
  'Electronics', 'Fashion', 'Collectibles', 'Art', 'Jewelry',
  'Vehicles', 'Home & Garden', 'Sports', 'Toys', 'Books',
  'Music', 'Gaming', 'Health & Beauty', 'Business', 'Other',
];
const CONDITIONS = ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'];

const defaultForm = {
  title: '', description: '', category: '', condition: '',
  startingPrice: '', reservePrice: '', buyNowPrice: '',
  minimumBidIncrement: '1', startTime: '', endTime: '',
  shipping: { isFree: false, cost: '', handlingTime: '3', location: '', international: false },
  tags: '',
  autoExtend: { enabled: true, minutes: '5' },
};

export default function CreateAuction() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const setShipping = (key, value) => setForm(prev => ({ ...prev, shipping: { ...prev.shipping, [key]: value } }));

  const validateStep = (current) => {
    if (current === 1) {
      if (!form.title.trim()) return fail('Title is required');
      if (!form.description.trim()) return fail('Description is required');
      if (!form.category) return fail('Category is required');
      if (!form.condition) return fail('Condition is required');
    }
    if (current === 2) {
      if (!form.startingPrice || Number(form.startingPrice) <= 0) return fail('A valid starting price is required');
      if (!form.startTime) return fail('Start time is required');
      if (!form.endTime) return fail('End time is required');
      if (new Date(form.endTime) <= new Date(form.startTime)) return fail('End time must be after start time');
      if (form.reservePrice && Number(form.reservePrice) < Number(form.startingPrice)) return fail('Reserve price must be greater than or equal to starting price');
      if (form.buyNowPrice && Number(form.buyNowPrice) <= Number(form.startingPrice)) return fail('Buy Now price must be greater than starting price');
    }
    return true;
  };

  const fail = (message) => {
    toast.error(message);
    return false;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!images.length) {
      toast.error('Please add at least one image');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        images,
        startingPrice: Number(form.startingPrice),
        reservePrice: form.reservePrice ? Number(form.reservePrice) : null,
        buyNowPrice: form.buyNowPrice ? Number(form.buyNowPrice) : null,
        minimumBidIncrement: Number(form.minimumBidIncrement) || 1,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        shipping: {
          ...form.shipping,
          cost: Number(form.shipping.cost) || 0,
          handlingTime: Number.parseInt(form.shipping.handlingTime, 10) || 3,
        },
        autoExtend: {
          ...form.autoExtend,
          minutes: Number.parseInt(form.autoExtend.minutes, 10) || 5,
        },
      };
      const res = await auctionAPI.create(payload);
      toast.success('Auction created successfully');
      navigate(`/auctions/${res.auction._id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page">
      <div className="container" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 28 }}>
          <p className="app-muted" style={{ marginBottom: 6 }}>Seller Console</p>
          <h1 className="app-title">Post Auction</h1>
        </div>

        <div className="tab-strip" style={{ marginBottom: 22 }}>
          {['Item Details', 'Pricing & Timing', 'Images & Shipping'].map((label, index) => {
            const number = index + 1;
            return (
              <button
                key={label}
                type="button"
                className={step === number ? 'active' : ''}
                onClick={() => number < step && setStep(number)}
              >
                {number}. {label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          {step === 1 && (
            <section className="app-card app-card-pad form-stack">
              <Field label="Auction Title">
                <input className="app-input" value={form.title} maxLength={120} onChange={event => set('title', event.target.value)} placeholder="Mercedes Benz G Class 2023" />
              </Field>
              <Field label="Description">
                <textarea className="app-textarea" value={form.description} onChange={event => set('description', event.target.value)} placeholder="Describe condition, history, included items, and delivery notes." />
              </Field>
              <div className="form-grid">
                <Field label="Category">
                  <select className="app-select" value={form.category} onChange={event => set('category', event.target.value)}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}
                  </select>
                </Field>
                <Field label="Condition">
                  <select className="app-select" value={form.condition} onChange={event => set('condition', event.target.value)}>
                    <option value="">Select condition</option>
                    {CONDITIONS.map(condition => <option key={condition} value={condition}>{condition}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Tags">
                <input className="app-input" value={form.tags} onChange={event => set('tags', event.target.value)} placeholder="car, luxury, manual" />
              </Field>
            </section>
          )}

          {step === 2 && (
            <section className="app-card app-card-pad form-stack">
              <div className="form-grid">
                <MoneyField label="Starting Price" value={form.startingPrice} onChange={value => set('startingPrice', value)} />
                <MoneyField label="Minimum Bid Increment" value={form.minimumBidIncrement} onChange={value => set('minimumBidIncrement', value)} />
                <MoneyField label="Reserve Price" value={form.reservePrice} onChange={value => set('reservePrice', value)} />
                <MoneyField label="Buy Now Price" value={form.buyNowPrice} onChange={value => set('buyNowPrice', value)} />
                <Field label="Start Time"><input className="app-input" type="datetime-local" value={form.startTime} onChange={event => set('startTime', event.target.value)} /></Field>
                <Field label="End Time"><input className="app-input" type="datetime-local" value={form.endTime} onChange={event => set('endTime', event.target.value)} /></Field>
              </div>
              <label className="app-check">
                <input type="checkbox" checked={form.autoExtend.enabled} onChange={event => setForm(prev => ({ ...prev, autoExtend: { ...prev.autoExtend, enabled: event.target.checked } }))} />
                Auto-extend auction near closing time
              </label>
              {form.autoExtend.enabled && (
                <Field label="Extend Minutes">
                  <input className="app-input" type="number" min="1" max="30" value={form.autoExtend.minutes} onChange={event => setForm(prev => ({ ...prev, autoExtend: { ...prev.autoExtend, minutes: event.target.value } }))} />
                </Field>
              )}
            </section>
          )}

          {step === 3 && (
            <>
              <section className="app-card app-card-pad">
                <h2 style={{ marginBottom: 14 }}>Images</h2>
                <ImageUploader images={images} onChange={setImages} />
              </section>
              <section className="app-card app-card-pad form-stack">
                <label className="app-check">
                  <input type="checkbox" checked={form.shipping.isFree} onChange={event => setShipping('isFree', event.target.checked)} />
                  Offer free shipping
                </label>
                <div className="form-grid">
                  {!form.shipping.isFree && <MoneyField label="Shipping Cost" value={form.shipping.cost} onChange={value => setShipping('cost', value)} />}
                  <Field label="Ships From"><input className="app-input" value={form.shipping.location} onChange={event => setShipping('location', event.target.value)} placeholder="Dhaka, Bangladesh" /></Field>
                  <Field label="Handling Time"><input className="app-input" type="number" min="1" max="30" value={form.shipping.handlingTime} onChange={event => setShipping('handlingTime', event.target.value)} /></Field>
                </div>
                <label className="app-check">
                  <input type="checkbox" checked={form.shipping.international} onChange={event => setShipping('international', event.target.checked)} />
                  Offer international shipping
                </label>
              </section>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            {step > 1 ? <button type="button" className="btn-secondary" onClick={() => setStep(prev => prev - 1)}>Back</button> : <span />}
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={() => validateStep(step) && setStep(prev => prev + 1)}>Continue</button>
            ) : (
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Publish Auction'}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label><span className="app-label">{label}</span>{children}</label>;
}

function MoneyField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <input className="app-input" type="number" min="0" step="0.01" value={value} onChange={event => onChange(event.target.value)} />
    </Field>
  );
}
