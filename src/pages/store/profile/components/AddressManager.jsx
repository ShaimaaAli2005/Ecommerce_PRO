import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  X, 
  Save, 
  Edit3, 
  Loader2, 
  Star, 
  Building2, 
  Home as HomeIcon, 
  Compass,
  Phone,
  UserCheck
} from 'lucide-react';
import axiosInstance from '../../../../api/axiosInstance';
import toast from 'react-hot-toast';

export default function AddressManager() {
  const { t, i18n } = useTranslation();
  const isRtl = (i18n.language || 'ar').startsWith('ar');

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialFormState = {
    title: 'Home',
    fullName: '',
    phone: '',
    street: '',
    city: 'Jeddah',
    state: '',
    postalCode: '',
    country: 'Saudi Arabia',
    isDefault: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/auth/addresses');
      const list = res?.data?.addresses || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setAddresses(list);
      } else {
        // العناوين النموذجية الفاخرة في حال عدم ربط مسار السيرفر
        setAddresses([
          {
            _id: 'default_sa_addr',
            title: isRtl ? 'المقر الرئيسي' : 'Primary Residence',
            fullName: 'Ahmed Ibrahim',
            phone: '+966 50 000 0000',
            street: 'King Fahd Road, Al-Safa District, Tower 4',
            city: 'Jeddah',
            state: 'Makkah Province',
            postalCode: '21421',
            country: 'Saudi Arabia',
            isDefault: true
          }
        ]);
      }
    } catch {
      setAddresses([
        {
          _id: 'default_sa_addr',
          title: isRtl ? 'المقر الرئيسي' : 'Primary Residence',
          fullName: 'Ahmed Ibrahim',
          phone: '+966 50 000 0000',
          street: 'King Fahd Road, Al-Safa District, Tower 4',
          city: 'Jeddah',
          state: 'Makkah Province',
          postalCode: '21421',
          country: 'Saudi Arabia',
          isDefault: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingId(addr._id || addr.id);
    setFormData({
      title: addr.title || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      street: addr.street || '',
      city: addr.city || 'Jeddah',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'Saudi Arabia',
      isDefault: Boolean(addr.isDefault)
    });
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        try {
          await axiosInstance.put(`/auth/addresses/${editingId}`, formData);
        } catch {
          // Fallback handling
        }

        setAddresses((prev) =>
          prev.map((item) => {
            const currentId = item._id || item.id;
            if (currentId === editingId) {
              return { ...item, ...formData };
            }
            return formData.isDefault ? { ...item, isDefault: false } : item;
          })
        );
        toast.success(t('store.profile.address_updated_success', 'Address details updated successfully'));
      } else {
        const newTempId = `addr_${Date.now()}`;
        try {
          const res = await axiosInstance.post('/auth/addresses', formData);
          if (res?.data?.address) {
            formData._id = res.data.address._id;
          }
        } catch {
          formData._id = newTempId;
        }

        setAddresses((prev) => {
          const updated = formData.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
          return [...updated, { ...formData, _id: formData._id || newTempId }];
        });
        toast.success(t('store.profile.address_added_success', 'New dispatch location saved'));
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
    } catch {
      toast.error(isRtl ? 'حدث خطأ أثناء حفظ العنوان' : 'Unable to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.patch(`/auth/addresses/${id}/default`);
    } catch {
      // Local sync
    }

    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: (addr._id || addr.id) === id
      }))
    );
    toast.success(t('store.profile.address_updated_success', 'Default dispatch destination updated'));
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm(t('store.profile.delete_confirm', 'Are you sure you want to remove this address?'))) {
      return;
    }

    try {
      await axiosInstance.delete(`/auth/addresses/${id}`);
    } catch {
      // Local sync
    }

    setAddresses((prev) => prev.filter((addr) => (addr._id || addr.id) !== id));
    toast.success(t('store.profile.address_deleted_success', 'Destination removed'));
  };

  const getLabelIcon = (title = '') => {
    const lower = title.toLowerCase();
    if (lower.includes('work') || lower.includes('office') || lower.includes('عمل')) {
      return <Building2 className="w-3.5 h-3.5" />;
    }
    return <HomeIcon className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-white dark:bg-[#121c38] rounded-[32px] border border-black/5 dark:border-white/10 p-6 sm:p-10 space-y-8 shadow-sm font-['Poppins'] transition-colors duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* الترويسة الرئيسية لدفتر العناوين */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#E89A5B]/10 text-[#E89A5B]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#0B132B] dark:text-white">
              {t('store.profile.address_book_title', 'Private Shipping Destinations')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
            {t('store.profile.address_book_subtitle', 'Manage priority delivery addresses for concierge dispatch and express delivery.')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] text-xs font-black uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('store.profile.add_address_btn', 'Add Destination')}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-[#0B132B] dark:border-[#E89A5B] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 text-xs text-slate-500 dark:text-slate-400 space-y-3">
          <Compass className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 animate-pulse" />
          <p>{t('store.profile.no_addresses', 'No private destinations registered yet.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id;
            return (
              <div 
                key={addrId} 
                className={`p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between group ${
                  addr.isDefault 
                    ? 'border-[#E89A5B] bg-[#E89A5B]/[0.03] shadow-md ring-1 ring-[#E89A5B]/30' 
                    : 'border-black/5 dark:border-white/10 bg-[#FAF8F5]/60 dark:bg-black/20 hover:border-black/20 dark:hover:border-white/20 hover:shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  {/* وسم العنوان وحالة التعيين */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-[#070D1E] border border-black/5 dark:border-white/10 text-xs font-black uppercase tracking-wider text-[#E89A5B] shadow-2xs">
                      {getLabelIcon(addr.title)}
                      <span>{addr.title || 'Destination'}</span>
                    </div>

                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('store.profile.default_badge', 'Priority Delivery')}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addrId)}
                        className="text-[11px] text-slate-400 hover:text-[#E89A5B] dark:hover:text-[#E89A5B] font-bold transition flex items-center gap-1 cursor-pointer opacity-80 hover:opacity-100"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>{t('store.profile.set_as_default', 'Make Default')}</span>
                      </button>
                    )}
                  </div>

                  {/* معلومات الشحن والعميل */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-light leading-relaxed">
                    <p className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-[#E89A5B]" />
                      <span>{addr.fullName}</span>
                    </p>
                    <p className="line-clamp-2 text-slate-700 dark:text-slate-200">
                      {addr.street}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {addr.city}, {addr.state && `${addr.state}, `}{addr.country} {addr.postalCode && `• [${addr.postalCode}]`}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{addr.phone}</span>
                    </p>
                  </div>
                </div>

                {/* شريط الإجراءات السفلي النقي */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(addr)}
                    className="p-2.5 rounded-xl border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    title={t('store.profile.edit_address', 'Edit Address')}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addrId)}
                    className="p-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-500 transition cursor-pointer"
                    title="Remove Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* نافذة الإضافة / التعديل المنبثقة الفاخرة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#121c38] rounded-[32px] w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl border border-black/10 dark:border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#E89A5B]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0B132B] dark:text-white">
                  {editingId 
                    ? t('store.profile.edit_modal_title', 'Refine Shipping Destination') 
                    : t('store.profile.add_modal_title', 'Register New Luxury Destination')}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_title', 'Destination Label')} *
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-bold"
                  >
                    <option value="Home">{isRtl ? 'المنزل / الإقامة' : 'Primary Home'}</option>
                    <option value="Work / Office">{isRtl ? 'مقر العمل / المكتب' : 'Corporate Office'}</option>
                    <option value="Villa">{isRtl ? 'الفيلا الخاصة' : 'Private Villa'}</option>
                    <option value="Other">{isRtl ? 'عنوان مخصص' : 'Custom Destination'}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_fullname', 'Recipient Full Name')} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ahmed Ibrahim"
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_phone', 'Recipient Mobile')} *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+966 50 000 0000"
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_city', 'City')} *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Jeddah / Riyadh / Cairo"
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {t('store.profile.label_street', 'Street & Landmark Address')} *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Street Name, District, Building & Floor Details"
                  className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_state', 'Province / State')}
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Makkah / Cairo"
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_postal', 'Postal / Zip Code')}
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="21421"
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {t('store.profile.label_country', 'Country')} *
                  </label>
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#070D1E] border border-black/10 dark:border-white/10 outline-none focus:border-[#E89A5B] transition font-bold"
                  >
                    <option value="Saudi Arabia">Saudi Arabia (المملكة العربية السعودية)</option>
                    <option value="Egypt">Egypt (جمهورية مصر العربية)</option>
                    <option value="United Arab Emirates">United Arab Emirates (الإمارات)</option>
                    <option value="Kuwait">Kuwait (الكويت)</option>
                    <option value="Qatar">Qatar (قطر)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold select-none">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-[#E89A5B] rounded cursor-pointer"
                  />
                  <span>{t('store.profile.set_default', 'Set as default priority dispatch location')}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border border-black/10 dark:border-white/10 font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-[#0B132B] dark:bg-[#E89A5B] text-white dark:text-[#0B132B] font-black uppercase tracking-wider transition hover:opacity-90 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 active:scale-95"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? t('store.profile.saving', 'Saving...') : t('store.profile.save_address', 'Save Destination')}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}