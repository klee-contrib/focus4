# Header

Le Header se construit à partir de tous ses éléments. Un Header complet se représente comme ceci :

```tsx
<HeaderScrolling canDeploy={/* ... */}>
    <HeaderTopRow>
        <HeaderItem>{/* ... */}</HeaderItem>
        <HeaderItem fillWidth stickyOnly>
            {/* ... */}
        </HeaderItem>
        <HeaderItem>{/* ... */}</HeaderItem>
    </HeaderTopRow>
    <HeaderContent>{/* ... */}</HeaderContent>
    <HeaderActions primary={/* ... */} secondary={/* ... */} />
</HeaderScrolling>
```

Un Header **doit être placé dans un `Scrollable`**, et sera donc rattaché en haut une fois replié. Il est donc notamment possible d'avoir des Header dans des `Popin`.

Un seul Header peut être posé par `Scrollable` en même temps, mais il est tout à fait possible (et conseillé) d'afficher un Header différent par "page" d'application.
