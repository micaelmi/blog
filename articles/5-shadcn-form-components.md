# 🧩 Customizing Form Components from Shadcn/UI

If you ever used the shadcn/ui components with React Hook Form, you may have noticed that even using these components, a form file end up as a giant file, because since the shadcn allows a great control of each part of the component, it becomes too big to just add in your form code. With this in mind, I figured a way to create a "default" of each form component, that still allows you to customize it.
So, let's take a look at the standard input component implemented inside the Form:

```ts
<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="shadcn" {...field} />
      </FormControl>
      <FormDescription>This is your public display name.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

It's clear there's too much code around this simple `<Input/>` intended to control the form field, so we can use one of the greatest `React` features and create a new component that embraces this pile of tags, returning a small component with its props, like this:

```ts
// src/components/form/input-default.tsx
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface InputDefaultProps {
  control: any;
  name: string;
  label?: string;
  placeholder: string;
  type?: string;
  description?: string;
  className?: string;
  inputClassname?: string;
}

export default function InputDefault({
  control,
  name,
  label,
  placeholder,
  type = "text",
  description,
  className,
  inputClassname,
}: InputDefaultProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              className={inputClassname}
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage />
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
}
```

In this component, there are some essential props, like `control` and `name`, and some customization props, such as labels and style properties. You can configure it the way you need it, like passing onChange events, disabled conditions or states, and by setting this properties as optional (`example?: string`) the component call will still be simple and customizable, like this:

```ts
// inside a form tag
<InputDefault
  control={form.control}
  name="username"
  label="Username"
  placeholder="Enter your username"
  // other properties go here
/>
```

On my projects, I created a folder `form` inside the `components` folder to save these "pre-styled" form components, for each new component there's a new file, that can envolve checkbox, select, date picker, text area and others.
Some components are a little more complex to implement this logic, like the select:

```ts
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";

interface SelectDefaultProps {
  control: any;
  name: string;
  title?: string;
  label: string;
  className?: string;
  values: {
    value: any;
    label: any;
  }[];
}

export default function SelectDefault({
  control,
  name,
  title,
  label,
  values,
  className,
}: SelectDefaultProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel> {title} </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="hover:bg-accent outline-none data-[placeholder]:text-muted-foreground hover:text-accent-foreground">
                <SelectValue placeholder={label} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {values.map((item, index) => (
                <SelectItem key={index} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
```

Since we don't know how the items of the select will be placed, we need to make it generic, with an array "values" with the key value and the label typed as "any", and making a `map()` of them in the select items. Consequently, the component implementation will have to follow the same structure, so the data may have to be formatted before the component call. Take a look:

```ts
const userTypeOptions = userTypes.map((userType) => ({
  label: userType.type,
  value: userType.id,
}));
```

```ts
<SelectDefault
  control={form.control}
  name="user_type_id"
  label="User type"
  title="Select the user type"
  values={userTypeOptions}
/>
```

But even with this complication, I think it's much better than just setting the whole select with form tags in your form.

And with this organized components and forms, certainly your application will look better and easier to maintain.
Comment if you do something similar or better than that, and if you agree that it's a good way to improve the code when using this stack.
