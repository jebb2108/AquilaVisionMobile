import {
  EYE_VALUES,
  GENDER_VALUES,
  OPERATION_TYPES,
} from '../data/clinicPatients';
import { AddPatientField, AddPatientRow } from '../features/addPatient/AddPatientField';
import {
  CycleButton,
  EyeChips,
  FemtoParams,
  GenderOptions,
} from '../features/addPatient/AddPatientOptions';
import { useAddPatientForm } from '../features/addPatient/useAddPatientForm';
import './AddPatientPage.scss';

const FEMTO_FLAP_VALUES = [90, 100, 110, 120, 130];
const FEMTO_RING_VALUES = [8.5, 9.0, 9.5];
const OPERATION_TYPE_VALUES = OPERATION_TYPES.map(item => item.value);

export default function AddPatientPage({ onAddPatient }) {
  const {
    error,
    form,
    isFemto,
    isFrk,
    operationLabel,
    phoneInputRef,
    cycleValue,
    handlePhoneBlur,
    handlePhoneChange,
    handlePhoneKeyDown,
    submitPatient,
    updateBirthDate,
    updateField,
  } = useAddPatientForm({ onAddPatient });

  return (
    <form className="add-patient" onSubmit={submitPatient}>
      <AddPatientField htmlFor="patientName" icon="fa-user" label="ФИО пациента">
        <input
          id="patientName"
          value={form.patientName}
          onChange={(event) => updateField('patientName', event.target.value)}
          placeholder="Фамилия Имя Отчество"
          autoComplete="off"
        />
      </AddPatientField>

      <AddPatientRow>
        <AddPatientField htmlFor="birthDate" icon="fa-cake-candles" label="Дата рождения">
          <input
            id="birthDate"
            inputMode="numeric"
            value={form.birthDate}
            onChange={(event) => updateBirthDate(event.target.value)}
            placeholder="дд.мм.гггг"
          />
        </AddPatientField>

        <AddPatientField
          className="add-patient__group--gender"
          icon="fa-venus-mars"
          label="Пол"
        >
          <GenderOptions
            genders={GENDER_VALUES}
            selectedGender={form.gender}
            onSelect={(value) => updateField('gender', value)}
          />
        </AddPatientField>
      </AddPatientRow>

      <AddPatientRow>
        <AddPatientField htmlFor="phone" icon="fa-phone" label="Телефон">
          <input
            ref={phoneInputRef}
            id="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onBlur={handlePhoneBlur}
            placeholder="+7 (___) ___-__-__"
            autoComplete="off"
            inputMode="tel"
          />
        </AddPatientField>

        <AddPatientField htmlFor="cardNumber" icon="fa-address-card" label="№ Карты">
          <input
            id="cardNumber"
            value={form.cardNumber}
            onChange={(event) => updateField('cardNumber', event.target.value)}
            placeholder="№ Карты"
            autoComplete="off"
          />
        </AddPatientField>
      </AddPatientRow>

      <AddPatientRow>
        <AddPatientField htmlFor="operationType" icon="fa-tag" label="Операция">
          <CycleButton
            id="operationType"
            onClick={() => cycleValue('type', OPERATION_TYPE_VALUES)}
          >
            {operationLabel}
          </CycleButton>
        </AddPatientField>

        <AddPatientField htmlFor="operationStart" icon="fa-clock" label="Время">
          <input
            type="time"
            id="operationStart"
            lang="ru-RU"
            step="300"
            value={form.operationStart}
            onChange={(event) => updateField('operationStart', event.target.value)}
          />
        </AddPatientField>
      </AddPatientRow>

      <EyeChips
        eyes={EYE_VALUES}
        selectedEye={form.eye}
        onSelect={(value) => updateField('eye', value)}
      />

      {isFemto ? (
        <FemtoParams
          flapThickness={form.flapThickness}
          ringDiameter={form.ringDiameter}
          onCycleFlap={() => cycleValue('flapThickness', FEMTO_FLAP_VALUES)}
          onCycleRing={() => cycleValue('ringDiameter', FEMTO_RING_VALUES)}
        />
      ) : !isFrk && (
        <AddPatientField htmlFor="operationCount" icon="fa-layer-group" label="Количество операций">
          <input
            id="operationCount"
            inputMode="numeric"
            value={form.operationCount}
            onChange={(event) => updateField('operationCount', event.target.value)}
          />
        </AddPatientField>
      )}

      <AddPatientField
        className="add-patient__group--notes"
        htmlFor="specialNotes"
        icon="fa-comment-medical"
        label="Особенности операции"
        optionalText=" (необязательно)"
      >
        <textarea
          id="specialNotes"
          value={form.specialNotes}
          onChange={(event) => updateField('specialNotes', event.target.value)}
          placeholder="Особые условия операции"
          rows="4"
        />
      </AddPatientField>

      {error && <div className="add-patient__error">{error}</div>}

      <div className="add-patient__actions">
        <button className="add-patient__submit" type="submit">
          <i className="fa-solid fa-plus"></i>
          Добавить в очередь
        </button>
      </div>
    </form>
  );
}
