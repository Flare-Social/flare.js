type FormDataCompatibleObject<T> = {
  [k in keyof T]?: string | File | Date | number | boolean;
};

export function createFormData<T extends FormDataCompatibleObject<T>>(data: T): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) formData.append(key, value, value.name);
    else if (value instanceof Date) formData.append(key, value.toISOString());
    else if (typeof value === 'boolean') formData.append(key, value ? 'true' : 'false');
    else if (typeof value === 'number') formData.append(key, value.toString());
    else formData.append(key, value as string);
  });

  return formData;
}