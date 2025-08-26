export interface PromoModal {
  title: string;
  text: string;
  promoCode?: string;
  shareText?: string;
  branchId?: string;
}

export interface PromoSlide {
  image: string;
  link?: string;
  modal?: PromoModal;
  active?: boolean;
}
