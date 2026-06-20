import { IonIcon } from '@ionic/react';
import {
  add,
  calendarOutline,
  callOutline,
  chevronBack,
  chevronDown,
  chevronForward,
  contractOutline,
  downloadOutline,
  expandOutline,
  idCardOutline,
  layersOutline,
  listOutline,
  maleFemaleOutline,
  medicalOutline,
  personAddOutline,
  personOutline,
  pricetagOutline,
  timeOutline,
} from 'ionicons/icons';

const ICONS = {
  add,
  calendar: calendarOutline,
  call: callOutline,
  chevronBack,
  chevronDown,
  chevronForward,
  contract: contractOutline,
  download: downloadOutline,
  expand: expandOutline,
  idCard: idCardOutline,
  layers: layersOutline,
  list: listOutline,
  medical: medicalOutline,
  person: personOutline,
  personAdd: personAddOutline,
  pricetag: pricetagOutline,
  sex: maleFemaleOutline,
  time: timeOutline,
};

const LEGACY_NAMES = {
  'fa-address-card': 'idCard',
  'fa-cake-candles': 'calendar',
  'fa-clock': 'time',
  'fa-comment-medical': 'medical',
  'fa-layer-group': 'layers',
  'fa-phone': 'call',
  'fa-tag': 'pricetag',
  'fa-user': 'person',
  'fa-venus-mars': 'sex',
};

export function AppIcon({ className = '', name, ...props }) {
  const iconName = LEGACY_NAMES[name] || name;

  return (
    <IonIcon
      aria-hidden="true"
      className={className}
      icon={ICONS[iconName]}
      {...props}
    />
  );
}
