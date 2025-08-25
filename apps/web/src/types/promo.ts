export interface PromoModal {
  title: string;
  text: string;
  promoCode?: string;
  shareText?: string;
}

export interface PromoSlide {
  image: string;
  link?: string;
  modal?: PromoModal;
}
