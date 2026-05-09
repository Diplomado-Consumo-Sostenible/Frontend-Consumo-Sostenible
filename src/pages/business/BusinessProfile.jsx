import { Building2, Clock, Globe, Images, Info, Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import EditableSection from '../../Components/business/profile/EditableSection';
import { HeaderDisplay, HeaderForm } from '../../Components/business/profile/BusinessProfileHeader';
import { GeneralInfoDisplay, GeneralInfoForm } from '../../Components/business/profile/BusinessGeneralInfo';
import { ContactDisplay, ContactForm } from '../../Components/business/profile/BusinessContactCard';
import { LocationDisplay, LocationForm } from '../../Components/business/profile/BusinessLocationCard';
import { ScheduleDisplay, ScheduleForm } from '../../Components/business/profile/BusinessScheduleCard';
import { GalleryDisplay, GalleryForm } from '../../Components/business/profile/BusinessImageGallery';
import BusinessCertificationsCard from '../../Components/business/profile/BusinessCertificationsCard';
import BusinessMetadata from '../../Components/business/profile/BusinessMetadata';
import BusinessStatsBar from '../../Components/business/profile/BusinessStatsBar';
import AuthAlert from '../../Components/ui/AuthAlert';
import useBusinessProfile from '../../hooks/useBusinessProfile';
import { updateMyBusiness } from '../../services/business/busienss.service';
import { getMyCertifications } from '../../services/certifications/certifications.service';
import { getTiposNegocio } from '../../services/types/tiposNegocio.service';

export default function BusinessProfile() {
  const { business, loading, error, retry } = useBusinessProfile();

  const [certifications, setCertifications] = useState([]);
  const [categories,     setCategories]     = useState([]);

  useEffect(() => {
    getMyCertifications()
      .then((d) => setCertifications(Array.isArray(d) ? d : []))
      .catch(() => {});

    getTiposNegocio()
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-7 h-7 animate-spin text-primary-mid" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-softest flex items-center justify-center">
          <Building2 className="w-8 h-8 text-muted" />
        </div>
        <div>
          <p className="text-base font-semibold text-heading">No tienes un negocio registrado</p>
          <p className="text-sm text-muted mt-1">
            {error
              ? 'No se pudo cargar la información. Intenta de nuevo.'
              : 'Crea tu negocio para comenzar a gestionar tu perfil.'}
          </p>
        </div>
        {error && (
          <button
            onClick={retry}
            className="text-sm font-medium text-primary-mid hover:text-primary-dark underline transition-colors"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  const id = business.id_business;

  async function save(fields) {
    await updateMyBusiness(id, fields);
    retry();
  }

  return (
    <div className="pl-14 pr-6 py-6 space-y-6 w-full">

      <EditableSection
        initialValues={{
          businessName: business.businessName,
          categoryId:   business.category?.id_category ?? business.category?.id ?? null,
          tagIds:       business.tags?.map((t) => t.id_tags) ?? [],
        }}
        onSave={(values) =>
          save({
            businessName: values.businessName,
            categoryId:   values.categoryId,
            tagIds:       values.tagIds,
          })
        }
        renderHeader={({ editButtons }) => (
          <HeaderDisplay
            business={business}
            editSlot={editButtons}
            onShare={() => navigator.clipboard?.writeText(window.location.href)}
            onLogoSave={(url) => save({ logo: url })}
          />
        )}
      >
        {({ values, setValues, editing }) =>
          editing ? (
            <HeaderForm
              values={values}
              onChange={setValues}
              categories={categories}
            />
          ) : null
        }
      </EditableSection>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7 space-y-6">

          <EditableSection
            title="Información General"
            icon={Info}
            initialValues={{ description: business.description, tags: business.tags }}
            onSave={(values) => save({ description: values.description })}
          >
            {({ values, setValues, editing }) =>
              editing
                ? <GeneralInfoForm values={values} onChange={setValues} />
                : <GeneralInfoDisplay description={values.description} tags={values.tags} />
            }
          </EditableSection>

          <EditableSection
            title="Galería de Imágenes"
            icon={Images}
            initialValues={{ images: business.images ?? [] }}
            onSave={(values) => save({ images: values.images })}
          >
            {({ values, setValues, editing }) =>
              editing
                ? <GalleryForm values={values} onChange={setValues} />
                : <GalleryDisplay images={values.images} />
            }
          </EditableSection>

          <BusinessStatsBar
            followers={business.followers_count}
            rating={business.average_rating}
            reviews={business.total_reviews}
          />

          <BusinessMetadata
            createdAt={business.createdAt}
            updatedAt={business.updatedAt}
          />

        </div>

        <div className="lg:col-span-5 space-y-6">

          <EditableSection
            title="Contacto"
            icon={Globe}
            initialValues={{
              address:       business.address,
              phone:         business.phone,
              emailBusiness: business.emailBusiness,
              website:       business.website,
              instagramUrl:  business.instagramUrl,
              facebookUrl:   business.facebookUrl,
              xUrl:          business.xUrl,
            }}
            onSave={(values) =>
              save({
                address:       values.address,
                phone:         values.phone,
                emailBusiness: values.emailBusiness,
                website:       values.website,
                instagramUrl:  values.instagramUrl,
                facebookUrl:   values.facebookUrl,
                xUrl:          values.xUrl,
              })
            }
          >
            {({ values, setValues, editing }) =>
              editing
                ? <ContactForm values={values} onChange={setValues} />
                : <ContactDisplay
                    address={values.address}
                    phone={values.phone}
                    emailBusiness={values.emailBusiness}
                    website={values.website}
                    instagramUrl={values.instagramUrl}
                    facebookUrl={values.facebookUrl}
                    xUrl={values.xUrl}
                  />
            }
          </EditableSection>

          <EditableSection
            title="Ubicación Geográfica"
            icon={MapPin}
            initialValues={{ latitude: business.latitude, longitude: business.longitude }}
            onSave={(values) =>
              save({ latitude: values.latitude, longitude: values.longitude })
            }
          >
            {({ values, setValues, editing }) =>
              editing
                ? <LocationForm values={values} onChange={setValues} />
                : <LocationDisplay latitude={values.latitude} longitude={values.longitude} />
            }
          </EditableSection>

          <EditableSection
            title="Horario"
            icon={Clock}
            initialValues={{ schedule: business.schedule ?? {} }}
            onSave={(values) => save({ schedule: values.schedule })}
          >
            {({ values, setValues, editing }) =>
              editing
                ? <ScheduleForm values={values} onChange={setValues} />
                : <ScheduleDisplay schedule={values.schedule} />
            }
          </EditableSection>

          <BusinessCertificationsCard certifications={certifications} />

        </div>
      </div>
    </div>
  );
}
