/*
  Пример моделирования входных данных с помощью flow.
*/

/* @flow */
import moment from 'moment'

const fields = [
  'id',
  'email',
  'first_name',
  'last_name',
  'gender',
  'phone',
  'birthday',
  'avatar',
  'is_online',
  'last_seen',
  'biography',
  'social_links',
  'rank',
  'rating',
  'created_at',
  'updated_at',
  'country_id',
];

export default class Customer {
  id: number;

  email: string;

  first_name: string;

  last_name: string;

  gender: string;

  phone: string;

  birthday: string;

  avatar: string;

  is_online: boolean;

  last_seen: string;

  biography: string;

  social_links: Array;

  rank: string;

  rating: number;

  created_at: string;

  updated_at: string;

  country_id: number;

  constructor(customer) {
    this._formattingUser(customer)
  }

  _formattingUser = (customer) => {
    fields.forEach((field) => {
      this[field] = customer[field]
    })

    (this.first_name || this.last_name) ? this.full_name = `${this.first_name || ''} ${this.last_name || ''}` : '';

    this.formated_last_seen = this.is_online
      ? 'Right Now'
      : moment(this.last_seen).isBefore(new Date(), 'day')
        ? moment(this.last_seen).format('MMM Do YY')
        : moment(this.last_seen).format('HH:mm');

    this.display_phone = this.phone ? this.phone.split('-')[1] : '';
    this.phone_code = this.phone ? this.phone.split('-')[0] : '1'
  }
}
