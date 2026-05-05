import { useEffect } from 'react';
import { useStore } from './store';
import {
  getCompany,
  createCompany,
  getTransactions,
  getCategories,
  getProducts,
  getRecurring,
  getSubscription,
} from './db';

export function useSupabaseData() {
  const { user } = useStore();

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Carrega empresa
      let company = await getCompany(user.id);
      if (!company) {
        company = await createCompany(user.id, 'Minha Empresa');
      }
      if (!company) return;

      // Carrega tudo em paralelo incluindo subscription
      const [transactions, categories, products, recurring, subscription] = await Promise.all([
        getTransactions(company.id),
        getCategories(company.id),
        getProducts(company.id),
        getRecurring(company.id),
        getSubscription(user.id),
      ]);

      useStore.setState({
        subscription: subscription
          ? {
              id: subscription.id,
              status: subscription.status,
              plan: subscription.plan,
              expires_at: subscription.expires_at,
            }
          : null,
        companies: [
          {
            id: company.id,
            name: company.name,
            logo: company.logo ?? undefined,
            primaryColor: company.primary_color ?? '#3b82f6',
            businessType: company.business_type ?? 'Serviços',
            monthlyRevenueGoal: company.monthly_revenue_goal ?? 0,
          },
        ],
        currentCompanyId: company.id,
        transactions: transactions.map((t: any) => ({
          id: t.id,
          companyId: t.company_id,
          type: t.type,
          value: t.value,
          description: t.description,
          category: t.category,
          date: t.date,
        })),
        categories: categories.map((c: any) => c.name),
        products: products.map((p: any) => ({
          id: p.id,
          companyId: p.company_id,
          name: p.name,
          price: p.price,
          stock: p.stock,
        })),
        recurringTransactions: recurring.map((r: any) => ({
          id: r.id,
          companyId: r.company_id,
          type: r.type,
          value: r.value,
          description: r.description,
          category: r.category,
          dayOfMonth: r.day_of_month,
          active: r.active,
        })),
      });
    };

    loadData();
  }, [user]);
}