-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Security definer function to get current user's company_id (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update their own company"
ON public.companies FOR UPDATE
USING (id = public.get_user_company_id(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for categories
CREATE POLICY "Users can view categories of their company"
ON public.categories FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can create categories in their company"
ON public.categories FOR INSERT
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete categories of their company"
ON public.categories FOR DELETE
USING (company_id = public.get_user_company_id(auth.uid()));

-- RLS Policies for transactions
CREATE POLICY "Users can view transactions of their company"
ON public.transactions FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can create transactions in their company"
ON public.transactions FOR INSERT
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update transactions of their company"
ON public.transactions FOR UPDATE
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete transactions of their company"
ON public.transactions FOR DELETE
USING (company_id = public.get_user_company_id(auth.uid()));

-- RLS Policies for recurring_transactions
CREATE POLICY "Users can view recurring of their company"
ON public.recurring_transactions FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can create recurring in their company"
ON public.recurring_transactions FOR INSERT
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update recurring of their company"
ON public.recurring_transactions FOR UPDATE
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete recurring of their company"
ON public.recurring_transactions FOR DELETE
USING (company_id = public.get_user_company_id(auth.uid()));

-- RLS Policies for products
CREATE POLICY "Users can view products of their company"
ON public.products FOR SELECT
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can create products in their company"
ON public.products FOR INSERT
WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update products of their company"
ON public.products FOR UPDATE
USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete products of their company"
ON public.products FOR DELETE
USING (company_id = public.get_user_company_id(auth.uid()));

-- Trigger functions for updated_at
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create company and profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
  default_company_name TEXT;
BEGIN
  -- Get company name from metadata or use default
  default_company_name := COALESCE(
    NEW.raw_user_meta_data ->> 'company_name',
    'Minha Empresa'
  );

  -- Create company
  INSERT INTO public.companies (name, primary_color, business_type)
  VALUES (default_company_name, '#3b82f6', 'Serviços')
  RETURNING id INTO new_company_id;

  -- Create profile linked to company
  INSERT INTO public.profiles (user_id, company_id, full_name, role)
  VALUES (
    NEW.id,
    new_company_id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'owner'
  );

  -- Create default categories
  INSERT INTO public.categories (company_id, name) VALUES
    (new_company_id, 'Serviço'),
    (new_company_id, 'Produto'),
    (new_company_id, 'Aluguel'),
    (new_company_id, 'Salários'),
    (new_company_id, 'Manutenção'),
    (new_company_id, 'Marketing'),
    (new_company_id, 'Outros');

  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_transactions_company_date ON public.transactions(company_id, date);
CREATE INDEX idx_recurring_company ON public.recurring_transactions(company_id);
CREATE INDEX idx_categories_company ON public.categories(company_id);
CREATE INDEX idx_products_company ON public.products(company_id);